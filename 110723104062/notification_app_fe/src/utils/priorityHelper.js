/**
 * Priority helper utilities
 * Handles notification scoring, type configuration, and time formatting
 */

// Notification type configuration with priority weights
export const NOTIFICATION_TYPES = {
  Placement: { weight: 3, color: '#1976d2', label: 'Placement' },
  Result: { weight: 2, color: '#388e3c', label: 'Result' },
  Event: { weight: 1, color: '#f57c00', label: 'Event' },
};

/**
 * Calculate priority score for a notification
 * Higher scores indicate higher priority
 * @param {Object} notification - Notification object
 * @param {number} minTimestamp - Minimum timestamp in dataset
 * @param {number} maxTimestamp - Maximum timestamp in dataset
 * @returns {number} Priority score (0-1)
 */
export const calculatePriorityScore = (notification, minTimestamp, maxTimestamp) => {
  // Get type weight
  const typeWeight = NOTIFICATION_TYPES[notification.Type]?.weight || 0;

  // Parse timestamp
  const timestamp = new Date(notification.Timestamp).getTime();

  // Normalize recency (0-1, where 1 is most recent)
  const recencyNorm = maxTimestamp !== minTimestamp 
    ? (timestamp - minTimestamp) / (maxTimestamp - minTimestamp) 
    : 0;

  // Calculate composite score: 60% type weight + 40% recency
  const typeScore = (typeWeight / 3) * 0.6; // Normalize to 0-1 range
  const finalScore = typeScore + (recencyNorm * 0.4);

  return Math.min(finalScore, 1); // Clamp to 1
};

/**
 * Get color for notification type
 * @param {string} type - Notification type
 * @returns {string} Hex color code
 */
export const getTypeColor = (type) => {
  return NOTIFICATION_TYPES[type]?.color || '#757575';
};

/**
 * Get background color for notification card
 * @param {string} type - Notification type
 * @param {boolean} isRead - Whether notification is read
 * @returns {string} Background color
 */
export const getBackgroundColor = (type, isRead) => {
  if (isRead) return '#f5f5f5';
  
  switch (type) {
    case 'Placement':
      return '#e3f2fd';
    case 'Result':
      return '#e8f5e9';
    case 'Event':
      return '#fff3e0';
    default:
      return '#fafafa';
  }
};

/**
 * Format timestamp to readable string
 * @param {string} timestamp - Timestamp string
 * @returns {string} Formatted date and time
 */
export const formatTime = (timestamp) => {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString();
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 100) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

/**
 * Sort notifications by priority (descending) then recency (newest first)
 * @param {Array} notifications - Array of notifications
 * @returns {Array} Sorted notifications
 */
export const sortByPriority = (notifications) => {
  if (!notifications.length) return [];

  // Calculate timestamps for scoring
  const timestamps = notifications.map((n) => new Date(n.Timestamp).getTime());
  const minTs = Math.min(...timestamps);
  const maxTs = Math.max(...timestamps);

  // Add scores and sort
  return notifications
    .map((n) => ({
      ...n,
      _score: calculatePriorityScore(n, minTs, maxTs),
      _timestamp: new Date(n.Timestamp).getTime(),
    }))
    .sort((a, b) => {
      // Primary sort: by score (descending)
      if (b._score !== a._score) return b._score - a._score;
      // Secondary sort: by timestamp (newest first)
      return b._timestamp - a._timestamp;
    });
};
