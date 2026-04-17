import { useEffect, useState } from "react";

import { getNotifications } from "../services/notificationService";
import { NOTIFICATIONS_UPDATED_EVENT } from "../utils/notificationEvents";

function useNotificationSummary(enabled = true) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setUnreadCount(0);
      return undefined;
    }

    let ignore = false;

    const loadNotificationSummary = async () => {
      try {
        const response = await getNotifications();

        if (!ignore) {
          setUnreadCount(Number(response.unread_count || 0));
        }
      } catch (error) {
        if (!ignore) {
          setUnreadCount(0);
        }
      }
    };

    void loadNotificationSummary();

    const handleNotificationsUpdated = () => {
      void loadNotificationSummary();
    };

    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleNotificationsUpdated);

    return () => {
      ignore = true;
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleNotificationsUpdated);
    };
  }, [enabled]);

  return {
    unreadCount
  };
}

export default useNotificationSummary;
