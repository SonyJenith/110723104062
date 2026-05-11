/**
 * Read state management
 * Tracks which notifications have been viewed using localStorage
 */

const READ_STATE_KEY = 'notification_read_state';

/**
 * Get all read notification IDs from localStorage
 * @returns {Set<string>} Set of read notification IDs
 */
export const getReadNotifications = () => {
  try {
    const stored = localStorage.getItem(READ_STATE_KEY);
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
};

/**
 * Check if a notification is read
 * @param {string} notificationId - ID of the notification
 * @returns {boolean} True if read, false if unread
 */
export const isRead = (notificationId) => {
  const readIds = getReadNotifications();
  return readIds.has(String(notificationId));
};

/**
 * Mark a single notification as read
 * @param {string} notificationId - ID of the notification
 */
export const markAsRead = (notificationId) => {
  const readIds = getReadNotifications();
  readIds.add(String(notificationId));
  localStorage.setItem(READ_STATE_KEY, JSON.stringify([...readIds]));
};

/**
 * Mark multiple notifications as read
 * @param {Array<string>} notificationIds - Array of notification IDs
 */
export const markMultipleAsRead = (notificationIds) => {
  const readIds = getReadNotifications();
  notificationIds.forEach((id) => readIds.add(String(id)));
  localStorage.setItem(READ_STATE_KEY, JSON.stringify([...readIds]));
};

/**
 * Mark a notification as unread
 * @param {string} notificationId - ID of the notification
 */
export const markAsUnread = (notificationId) => {
  const readIds = getReadNotifications();
  readIds.delete(String(notificationId));
  localStorage.setItem(READ_STATE_KEY, JSON.stringify([...readIds]));
};

/**
 * Clear all read state (mark all as unread)
 */
export const clearAllReadState = () => {
  localStorage.removeItem(READ_STATE_KEY);
};

/**
 * Get count of unread notifications
 * @param {Array} notifications - Array of notifications
 * @returns {number} Count of unread notifications
 */
export const getUnreadCount = (notifications) => {
  const readIds = getReadNotifications();
  return notifications.filter((n) => !readIds.has(String(n.ID))).length;
};
