import { AppNotification, User } from '../types';

/**
 * Determines whether a notification should be visible to the current active user.
 * Prevents "opposite" notifications (e.g., Circle Admin seeing payment confirmed receipt
 * intended for the member, or Member seeing confirmation request intended for the circle admin).
 */
export function isNotificationVisibleToUser(
  notification: AppNotification,
  currentUser: User | null,
  currentCircleId?: string
): boolean {
  if (!currentUser) return false;

  // 1. Circle isolation: If notification has a specific circleId, ensure it matches the active circle
  if (notification.circleId && currentCircleId && notification.circleId !== currentCircleId) {
    return false;
  }

  const isAdmin = currentUser.role === 'circle_admin' || currentUser.role === 'super_admin';
  const notifUserId = notification.userId;
  const titleLower = (notification.title || '').toLowerCase();
  const messageLower = (notification.message || '').toLowerCase();

  // 2. Explicit targetRole check
  if (notification.targetRole === 'circle_admin') {
    return isAdmin;
  }

  if (notification.targetRole === 'member') {
    // If targeted to a specific member ID, must match current user ID
    if (notifUserId && notifUserId !== 'all') {
      return notifUserId === currentUser.id;
    }
    // If not targeted to a specific user, only regular members see it
    return !isAdmin;
  }

  if (notification.targetRole === 'all') {
    return true;
  }

  // 3. Heuristic / Legacy fallback for notifications created before targetRole field
  const isAdminRequestNotification =
    titleLower.includes('confirmation request') ||
    messageLower.includes('please confirm if payment is received') ||
    notifUserId === 'admin';

  if (isAdminRequestNotification) {
    return isAdmin;
  }

  const isMemberConfirmationNotification =
    titleLower.includes('confirmed') ||
    titleLower.includes('not received') ||
    titleLower.includes('declined') ||
    messageLower.includes('confirmed your payment') ||
    messageLower.includes('unable to verify your payment');

  if (isMemberConfirmationNotification) {
    if (notifUserId && notifUserId !== 'admin' && notifUserId !== 'all') {
      return notifUserId === currentUser.id;
    }
    return !isAdmin;
  }

  // 4. User ID direct match (if notification is addressed to an individual user)
  if (notifUserId && notifUserId !== 'admin' && notifUserId !== 'all') {
    return notifUserId === currentUser.id;
  }

  return true;
}
