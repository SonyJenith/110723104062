import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import NotificationCard from '../components/NotificationCard';
import FilterBar from '../components/FilterBar';
import { LoadingSkeleton, EmptyState, ErrorState, NoFiltersMatchState } from '../components/StateComponents';
import { fetchNotifications } from '../api/notificationsApi';
import { sortByPriority } from '../utils/priorityHelper';

const AllNotifications = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [readStatus, setReadStatus] = useState({});

  useEffect(() => {
    loadNotifications();
  }, [page, pageSize, selectedTypes]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: pageSize,
      };

      if (selectedTypes.length > 0) {
        const allResults = [];
        for (const type of selectedTypes) {
          const result = await fetchNotifications({ ...params, type });
          allResults.push(...result.data);
        }
        const sorted = sortByPriority(allResults);
        setNotifications(sorted);
        setFilteredNotifications(sorted);
        setTotalPages(Math.ceil(sorted.length / pageSize));
      } else {
        const result = await fetchNotifications(params);
        const sorted = sortByPriority(result.data || []);
        setNotifications(sorted);
        setFilteredNotifications(sorted);
        setTotalPages(result.totalPages || Math.ceil((result.data?.length || 0) / pageSize));
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err.message || 'Failed to load notifications');
      setFilteredNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (newTypes) => {
    setSelectedTypes(newTypes);
    setPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setPage(1);
  };

  const handleReadStatusChange = (notificationId, isRead) => {
    setReadStatus((prev) => ({
      ...prev,
      [notificationId]: isRead,
    }));
  };

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayedNotifications = filteredNotifications.slice(startIndex, endIndex);
  const calculatedTotalPages = Math.ceil(filteredNotifications.length / pageSize);

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
          All Notifications
        </Typography>
        <Typography variant="body2" sx={{ color: '#8b949e' }}>
          {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      <FilterBar selectedTypes={selectedTypes} onTypeChange={handleTypeChange} />

      {loading && <LoadingSkeleton count={pageSize} />}

      {error && !loading && (
        <ErrorState message={error} onRetry={loadNotifications} />
      )}

      {!loading && !error && filteredNotifications.length === 0 && (
        selectedTypes.length > 0 ? (
          <NoFiltersMatchState filterCount={selectedTypes.length} />
        ) : (
          <EmptyState message="No notifications available" />
        )
      )}

      {!loading && !error && displayedNotifications.length > 0 && (
        <>
          <Box sx={{ mb: 4 }}>
            {displayedNotifications.map((notification) => (
              <NotificationCard
                key={notification.ID}
                notification={notification}
                onReadStatusChange={handleReadStatusChange}
              />
            ))}
          </Box>

          <Paper
            sx={{
              p: 2,
              backgroundColor: '#161b22',
              border: '1px solid #30363d',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 100 }} size="small">
                <InputLabel sx={{ color: '#79c0ff' }}>Per Page</InputLabel>
                <Select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  label="Per Page"
                  sx={{
                    color: '#e6edf3',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#30363d',
                    },
                  }}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" sx={{ color: '#8b949e' }}>
                {calculatedTotalPages > 0 ? `Page ${page} of ${calculatedTotalPages}` : 'No pages'}
              </Typography>
            </Box>
            {calculatedTotalPages > 1 && (
              <Pagination
                count={calculatedTotalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size={isMobile ? 'small' : 'medium'}
              />
            )}
          </Paper>
        </>
      )}
    </Container>
  );
};

export default AllNotifications;
