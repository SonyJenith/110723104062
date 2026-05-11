import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Chip,
} from '@mui/material';
import { getTypeColor, getBackgroundColor, formatTime } from '../utils/priorityHelper';
import { isRead, markAsRead } from '../utils/readState';

const NotificationCard = ({ notification, onReadStatusChange, showRank = false, rank = null }) => {
  const [localIsRead, setLocalIsRead] = useState(isRead(notification.ID));
  const notificationRead = localIsRead;
  const typeColor = getTypeColor(notification.Type);
  const bgColor = getBackgroundColor(notification.Type);

  const handleToggleRead = () => {
    markAsRead(notification.ID, !notificationRead);
    setLocalIsRead(!notificationRead);
    if (onReadStatusChange) {
      onReadStatusChange(notification.ID, !notificationRead);
    }
  };

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: `4px solid ${typeColor}`,
        backgroundColor: notificationRead ? '#161b22' : 'rgba(25, 118, 210, 0.08)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-2px)',
        },
        opacity: notificationRead ? 0.8 : 1,
      }}
    >
      <CardContent sx={{ pb: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            {showRank && rank !== null && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: typeColor,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}
              >
                {rank}
              </Box>
            )}
            <Chip
              label={notification.Type}
              size="small"
              sx={{
                backgroundColor: bgColor,
                color: '#fff',
                fontWeight: 600,
              }}
            />
          </Box>
          <IconButton
            size="small"
            onClick={handleToggleRead}
            sx={{
              color: typeColor,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
              },
            }}
            title={notificationRead ? 'Mark as Unread' : 'Mark as Read'}
          >
            {notificationRead ? '✓' : '○'}
          </IconButton>
        </Box>

        <Typography
          variant="body2"
          sx={{
            mb: 1.5,
            color: notificationRead ? '#8b949e' : '#e6edf3',
            lineHeight: 1.6,
            wordBreak: 'break-word',
          }}
        >
          {notification.Message}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            variant="caption"
            sx={{
              color: '#79c0ff',
              fontWeight: 500,
            }}
          >
            {formatTime(notification.Timestamp)}
          </Typography>
          {notificationRead && (
            <Typography
              variant="caption"
              sx={{
                backgroundColor: 'rgba(139, 148, 158, 0.2)',
                px: 1,
                py: 0.5,
                borderRadius: '4px',
                color: '#8b949e',
              }}
            >
              Read
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default NotificationCard;
