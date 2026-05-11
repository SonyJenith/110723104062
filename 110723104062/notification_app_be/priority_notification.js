const MinHeap = require('./min_heap');

const API_URL = 'http://4.224.186.213/evaluation-service/notifications';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJkc29ueTE1QGpubi5lZHUuaW4iLCJleHAiOjE3Nzg0ODMzMjcsImlhdCI6MTc3ODQ4MjQyNywiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImQxYTIyNmE4LWNiOTktNDk0Yi1hNDMwLWUwMzY0ZThjY2YwYiIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InNvbnkgamVuaXRoIGQiLCJzdWIiOiJhZDM3OTk3YS1lNjc2LTQ0MWQtOGYxOC01Mjc4Y2YzZjEyZWMifSwiZW1haWwiOiJkc29ueTE1QGpubi5lZHUuaW4iLCJuYW1lIjoic29ueSBqZW5pdGggZCIsInJvbGxObyI6IjExMDcyMzEwNDA2MiIsImFjY2Vzc0NvZGUiOiJXTk1jcU4iLCJjbGllbnRJRCI6ImFkMzc5OTdhLWU2NzYtNDQxZC04ZjE4LTUyNzhjZjNmMTJlYyIsImNsaWVudFNlY3JldCI6ImFGV0FzUnhIcFdZeGZVdlUifQ.XtoA6NfGkptc_SsKJ_UPGbWOyEpNdKQ1-eBXWfOEPzg';
const TOP_N = 10;
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

async function fetchAllNotifications() {
  let page = 1;
  const limit = 10;
  const all = [];
  const maxFetch = 1000; // Limit to 1000 notifications for performance

  while (true) {
    const url = `${API_URL}?page=${page}&limit=${limit}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API error ${response.status} ${response.statusText}: ${errorBody}`);
    }

    const json = await response.json();
    const batch = Array.isArray(json) ? json : json.data ?? json.notifications ?? [];

    if (batch.length === 0) break;
    all.push(...batch);
    
    console.log(`Fetched: ${all.length} notifications...`);
    
    if (batch.length < limit || all.length >= maxFetch) break;
    page++;
  }

  return all;
}

async function main() {
  const notifications = await fetchAllNotifications();

  if (notifications.length === 0) {
    console.log('No notifications returned.');
    return;
  }

  const timestamps = notifications.map(n => new Date(n.Timestamp).getTime());
  const minTs = Math.min(...timestamps);
  const maxTs = Math.max(...timestamps);

  const scored = notifications.map(n => ({
    ...n,
    _score: computeScore(n, minTs, maxTs),
  }));

  const inbox = new PriorityInbox(TOP_N);
  for (const n of scored) {
    inbox.add(n);
  }

  const top = inbox.getTop();

  console.log(`TOP ${TOP_N} PRIORITY NOTIFICATIONS`);
  console.log('='.repeat(72));

  top.forEach((n, idx) => {
    const date = new Date(n.Timestamp).toLocaleString();
    const type = (n.Type ?? 'Unknown').toUpperCase();
    console.log(`\n#${idx + 1}  [${type}]  Score: ${n._score.toFixed(4)}`);
    console.log(`    Title   : ${n.Message ?? ''}`);
    console.log(`    Message : ${(n.Message ?? '').slice(0, 120)}`);
    console.log(`    Date    : ${date}`);
    console.log(`    ID      : ${n.ID ?? 'N/A'}`);
  });

  console.log('\n' + '='.repeat(72));
  console.log(`\nTotal fetched: ${notifications.length} | Showing top: ${top.length}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});