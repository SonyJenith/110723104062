import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import NotificationCard from '../components/NotificationCard';
import { LoadingSkeleton, EmptyState, ErrorState } from '../components/StateComponents';
import { fetchNotifications } from '../api/notificationsApi';
import { sortByPriority, calculatePriorityScore } from '../utils/priorityHelper';


const PriorityInbox = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topN, setTopN] = useState(10);
  const [readStatus, setReadStatus] = useState({});

  useEffect(() => {
    loadPriorityNotifications();
  }, [topN]);

  const loadPriorityNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchNotifications({ page: 1, limit: 100 });
      const allNotifications = result.data || [];
      const sorted = sortByPriority(allNotifications);
      const topNotifications = sorted.slice(0, topN);

      setNotifications(topNotifications);
      setFilteredNotifications(topNotifications);
    } catch (err) {
      console.error('Error loading priority notifications:', err);
      setError(err.message || 'Failed to load notifications');
      setFilteredNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTopNChange = (event) => {
    const value = Math.max(1, Math.min(100, parseInt(event.target.value) || 10));
    setTopN(value);
  };

  const handleReadStatusChange = (notificationId, isRead) => {
    setReadStatus((prev) => ({
      ...prev,
      [notificationId]: isRead,
    }));
  };

  const getCalculatedScore = (notification) => {
    return calculatePriorityScore(notification).toFixed(2);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 0.5,
            fontSize: isMobile ? '1.5rem' : '2rem',
          }}
        >
          Priority Inbox
        </Typography>
        <Typography variant="body2" sx={{ color: '#8b949e' }}>
          Top priority notifications ranked by importance and recency
        </Typography>
      </Box>

      <Paper
        sx={{
          p: 2,
          mb: 4,
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
        }}
      >
        <TextField
          label="Show top N notifications"
          type="number"
          value={topN}
          onChange={handleTopNChange}
          size="small"
          inputProps={{ min: 1, max: 100 }}
          sx={{
            width: isMobile ? '100%' : 150,
            '& .MuiOutlinedInput-root': {
              color: '#e6edf3',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#30363d',
            },
            '& label': {
              color: '#8b949e',
            },
          }}
        />
        <Button
          variant="outlined"
          onClick={loadPriorityNotifications}
          sx={{
            color: '#79c0ff',
            borderColor: '#30363d',
            '&:hover': {
              borderColor: '#79c0ff',
              backgroundColor: 'rgba(121, 192, 255, 0.1)',
            },
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          {isMobile ? 'Refresh' : 'Refresh Priority'}
        </Button>
      </Paper>

      {/* Loading State */}
      {loading && <LoadingSkeleton count={topN} />}

      {/* Error State */}
      {error && !loading && (
        <ErrorState message={error} onRetry={loadPriorityNotifications} />
      )}

      {!loading && !error && filteredNotifications.length === 0 && (
        <EmptyState message="No notifications to prioritize" />
      )}

      {!loading && !error && filteredNotifications.length > 0 && (
        <Box>
          {filteredNotifications.map((notification, index) => (
            <Box key={notification.ID} sx={{ position: 'relative', mb: 2 }}>
              <NotificationCard
                notification={notification}
                onReadStatusChange={handleReadStatusChange}
                showRank={true}
                rank={index + 1}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  backgroundColor: 'rgba(121, 192, 255, 0.15)',
                  border: '1px solid #79c0ff',
                  borderRadius: '4px',
                  px: 1.5,
                  py: 0.75,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: '#8b949e',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Score
                </Typography>
                <Typography
                  sx={{
                    color: '#79c0ff',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                  }}
                >
                  {getCalculatedScore(notification)}
                </Typography>
              </Box>
            </Box>
          ))}


          <Paper
            sx={{
              mt: 4,
              p: 2,
              backgroundColor: '#161b22',
              border: '1px solid #30363d',
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" sx={{ color: '#8b949e' }}>
              Showing {filteredNotifications.length} of your top notifications, ranked by type priority and recency
            </Typography>
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default PriorityInbox;
