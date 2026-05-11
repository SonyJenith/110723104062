const express = require('express');
const cors = require('cors');
const MinHeap = require('./min_heap');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const API_URL = 'http://4.224.186.213/evaluation-service/notifications';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJkc29ueTE1QGpubi5lZHUuaW4iLCJleHAiOjE3Nzg0ODMzMjcsImlhdCI6MTc3ODQ4MjQyNywiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImQxYTIyNmE4LWNiOTktNDk0Yi1hNDMwLWUwMzY0ZThjY2YwYiIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InNvbnkgamVuaXRoIGQiLCJzdWIiOiJhZDM3OTk3YS1lNjc2LTQ0MWQtOGYxOC01Mjc4Y2YzZjEyZWMifSwiZW1haWwiOiJkc29ueTE1QGpubi5lZHUuaW4iLCJuYW1lIjoic29ueSBqZW5pdGggZCIsInJvbGxObyI6IjExMDcyMzEwNDA2MiIsImFjY2Vzc0NvZGUiOiJXTk1jcU4iLCJjbGllbnRJRCI6ImFkMzc5OTdhLWU2NzYtNDQxZC04ZjE4LTUyNzhjZjNmMTJlYyIsImNsaWVudFNlY3JldCI6ImFGV0FzUnhIcFdZeGZVdlUifQ.XtoA6NfGkptc_SsKJ_UPGbWOyEpNdKQ1-eBXWfOEPzg';

const TYPE_WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function computeScore(notification, minTs, maxTs) {
  const typeWeight = TYPE_WEIGHTS[notification.Type] ?? 1;
  const ts = new Date(notification.Timestamp).getTime();
  const recencyNorm = maxTs !== minTs ? (ts - minTs) / (maxTs - minTs) : 1;
  return (typeWeight / 3) * 0.6 + recencyNorm * 0.4;
}

function byScoreAsc(a, b) {
  return a._score - b._score;
}

class PriorityInbox {
  constructor(n) {
    this.n = n;
    this.heap = new MinHeap(byScoreAsc);
  }

  add(notification) {
    if (this.heap.size < this.n) {
      this.heap.push(notification);
    } else if (notification._score > this.heap.peek()._score) {
      this.heap.pop();
      this.heap.push(notification);
    }
  }

  getTop() {
    return this.heap.toSortedArray();
  }
}

let cachedNotifications = [];
let lastFetchTime = 0;

async function fetchAllNotifications() {
  let page = 1;
  const limit = 10;
  const all = [];
  const maxFetch = 1000;

  while (true) {
    const url = `${API_URL}?page=${page}&limit=${limit}`;
    console.log(`Fetching page ${page} from ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      });

      if (!response.ok) {
        console.error(`HTTP error ${response.status}`);
        break;
      }

      const data = await response.json();
      console.log(`Page ${page}: data type = ${typeof data}, keys = ${Array.isArray(data) ? 'array' : Object.keys(data).join(', ')}`);
      
      let batch = [];
      if (Array.isArray(data)) {
        batch = data;
      } else if (data.data && Array.isArray(data.data)) {
        batch = data.data;
      } else if (data.notifications && Array.isArray(data.notifications)) {
        batch = data.notifications;
      } else if (data.notification && Array.isArray(data.notification)) {
        batch = data.notification;
      } else {
        console.log(`Unexpected response structure: ${JSON.stringify(data).substring(0, 200)}`);
      }
      
      console.log(`Page ${page}: extracted ${batch.length} items`);
      if (batch.length === 0) break;

      all.push(...batch);
      console.log(`Total fetched: ${all.length}`);
      
      if (batch.length < limit || all.length >= maxFetch) break;
      page++;
    } catch (err) {
      console.error(`Fetch error: ${err.message}`);
      break;
    }
  }

  return all;
}

app.get('/api/notifications', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] GET /api/notifications - page=${req.query.page}, limit=${req.query.limit}, type=${req.query.type}`);
    
    const now = Date.now();
    if (now - lastFetchTime > 300000 || cachedNotifications.length === 0) {
      console.log(`Fetching notifications from external API...`);
      cachedNotifications = await fetchAllNotifications();
      lastFetchTime = now;
      console.log(`Cached ${cachedNotifications.length} notifications`);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type;

    let filtered = cachedNotifications;
    if (type) {
      filtered = filtered.filter(n => n.Type === type);
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    console.log(`Returning ${paginated.length} notifications (${filtered.length} after filter)`);
    res.json({
      data: paginated,
      totalPages: Math.ceil(filtered.length / limit),
      page,
    });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/priority', async (req, res) => {
  try {
    const topN = parseInt(req.query.topN) || 10;

    if (cachedNotifications.length === 0) {
      cachedNotifications = await fetchAllNotifications();
    }

    const timestamps = cachedNotifications.map(n => new Date(n.Timestamp).getTime());
    const minTs = Math.min(...timestamps);
    const maxTs = Math.max(...timestamps);

    const scored = cachedNotifications.map(n => ({
      ...n,
      _score: computeScore(n, minTs, maxTs),
    }));

    const inbox = new PriorityInbox(topN);
    for (const n of scored) {
      inbox.add(n);
    }

    const top = inbox.getTop();
    res.json({ data: top, total: cachedNotifications.length });
  } catch (err) {
    console.error('Priority API error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
