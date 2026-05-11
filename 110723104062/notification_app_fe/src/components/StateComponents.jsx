import React from 'react';
import {
  Box,
  Card,
  Skeleton,
  Typography,
  Alert,
  Button,
  Container,
} from '@mui/material';

export const LoadingSkeleton = ({ count = 5 }) => (
  <Box>
    {Array.from({ length: count }).map((_, index) => (
      <Card
        key={index}
        sx={{
          mb: 2,
          borderLeft: '4px solid transparent',
          backgroundColor: '#161b22',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ mb: 1.5, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: '4px' }} />
            <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: '4px' }} />
          </Box>
          <Skeleton variant="text" height={40} sx={{ mb: 1.5 }} />
          <Skeleton variant="text" height={20} width="40%" />
        </Box>
      </Card>
    ))}
  </Box>
);

export const EmptyState = ({ message = 'No notifications found' }) => (
  <Container maxWidth="sm">
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          fontSize: 64,
          color: '#30363d',
          mb: 2,
        }}
      >
        Inbox
      </Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          mb: 1,
          color: '#8b949e',
        }}
      >
        All caught up!
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: '#6e7681',
          mb: 3,
        }}
      >
        {message}
      </Typography>
    </Box>
  </Container>
);

export const ErrorState = ({ message = 'Error loading notifications', onRetry = null }) => (
  <Container maxWidth="sm">
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
      }}
    >
      <Alert
        severity="error"
        sx={{
          width: '100%',
          borderRadius: '8px',
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Error Loading Notifications
          </Typography>
          <Typography variant="caption" sx={{ color: 'inherit', opacity: 0.8 }}>
            {message}
          </Typography>
        </Box>
      </Alert>
      {onRetry && (
        <Button
          variant="contained"
          onClick={onRetry}
          sx={{
            mt: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Try Again
        </Button>
      )}
    </Box>
  </Container>
);

export const NoFiltersMatchState = ({ filterCount }) => (
  <Container maxWidth="sm">
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          fontSize: 64,
          color: '#30363d',
          mb: 2,
        }}
      >
        Inbox
      </Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          mb: 1,
          color: '#8b949e',
        }}
      >
        No notifications match
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: '#6e7681',
        }}
      >
        Try adjusting your filters for {filterCount} selected type{filterCount !== 1 ? 's' : ''}
      </Typography>
    </Box>
  </Container>
);
