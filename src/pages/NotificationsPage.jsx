import { startTransition, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";
import StatusBanner from "../components/common/StatusBanner";
import SurfaceCard from "../components/common/SurfaceCard";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "../services/notificationService";
import { emitNotificationsUpdated } from "../utils/notificationEvents";
import { getStoredUser } from "../utils/auth";

const formatNotificationDate = (value) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));

function NotificationsPage() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const fallbackPath = user?.role === "customer" ? "/my-orders" : "/dashboard";
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pendingId, setPendingId] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getNotifications();

      startTransition(() => {
        setNotifications(response.notifications || []);
        setUnreadCount(response.unread_count || 0);
      });
      emitNotificationsUpdated();
    } catch (apiError) {
      setError(apiError.message || "Failed to load notifications");
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    const search = searchValue.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchesSearch =
        !search ||
        notification.title?.toLowerCase().includes(search) ||
        notification.message?.toLowerCase().includes(search);

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "unread" ? !notification.is_read : notification.is_read);

      return matchesSearch && matchesStatus;
    });
  }, [notifications, searchValue, statusFilter]);

  const handleMarkRead = async (notificationId) => {
    try {
      setPendingId(`read-${notificationId}`);
      setError("");
      const response = await markNotificationRead(notificationId);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId ? response.notification || { ...notification, is_read: true } : notification
        )
      );
      setUnreadCount((current) => Math.max(0, current - 1));
      emitNotificationsUpdated();
    } catch (apiError) {
      setError(apiError.message || "Failed to mark notification as read");
    } finally {
      setPendingId("");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setPendingId("read-all");
      setError("");
      const response = await markAllNotificationsRead();
      setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })));
      setUnreadCount(0);
      setMessage(
        response.updated_count
          ? `${response.updated_count} notification(s) marked as read.`
          : "All notifications are already read."
      );
      emitNotificationsUpdated();
    } catch (apiError) {
      setError(apiError.message || "Failed to mark all notifications as read");
    } finally {
      setPendingId("");
    }
  };

  const getNotificationTarget = (notification) => {
    if (notification.link_url) {
      return notification.link_url;
    }

    if (notification.reference_id && notification.type === "order") {
      return `/my-orders/${notification.reference_id}`;
    }

    return "";
  };

  const handleOpenNotification = async (notification) => {
    if (!notification.is_read) {
      await handleMarkRead(notification.id);
    }

    const targetPath = getNotificationTarget(notification);

    if (targetPath) {
      navigate(targetPath);
    }
  };

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Notifications"
        title="Updates from the store and CRM"
        description="Track payment verification, order movement, shipment progress, return decisions, and review moderation in one place."
        actions={
          <>
            <div className="rounded-full border border-line bg-white px-4 py-2.5 text-[13px] font-medium text-ink">
              {unreadCount} unread
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleMarkAllRead}
              disabled={pendingId === "read-all" || !notifications.length}
              className="ui-compact-button"
            >
              {pendingId === "read-all" ? "Working..." : "Mark All Read"}
            </Button>
          </>
        }
      />

      <StatusBanner tone="success">{message}</StatusBanner>
      <StatusBanner tone="danger">{error}</StatusBanner>

      <SurfaceCard className="space-y-4 !p-4 md:!p-5">
        {loading ? <p className="text-sm text-secondary">Loading notifications...</p> : null}

        {!loading && !notifications.length ? (
          <EmptyState
            title="No notifications yet"
            description="New order, payment, shipment, review, and return events will appear here as the platform is used."
          />
        ) : null}

        {notifications.length ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-[20px] border border-soft bg-page/70 p-3.5 md:flex-row md:items-center md:justify-between">
              <div className="relative min-w-0 flex-1 md:max-w-sm">
                <input
                  type="search"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search notifications"
                  className="ui-input !rounded-[12px] !bg-white !px-3.5 !py-2.5 !text-[13px]"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="ui-input md:w-[180px] !rounded-[12px] !bg-white !px-3.5 !py-2.5 !text-[13px]"
              >
                <option value="">All notifications</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>

            {!filteredNotifications.length ? (
              <EmptyState
                title="No matching notifications"
                description="Try a different search term or switch the read status filter."
              />
            ) : null}

            {filteredNotifications.map((notification) => (
              <article
                key={notification.id}
                className={`rounded-[24px] border p-5 ${notification.is_read ? "border-line bg-page" : "border-soft bg-canvas shadow-soft"
                  } ${!notification.is_read || getNotificationTarget(notification) ? "cursor-pointer" : ""}`}
                onClick={() => handleOpenNotification(notification)}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-base font-semibold text-ink">{notification.title}</p>
                      {!notification.is_read ? (
                        <span className="rounded-full bg-page px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink">
                          Unread
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2.5 max-w-3xl text-[13px] leading-6 text-secondary">{notification.message}</p>
                    <p className="mt-2.5 text-[12px] text-muted">{formatNotificationDate(notification.created_at)}</p>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {notification.link_url ? (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleOpenNotification(notification);
                        }}
                        className="ui-compact-button"
                      >
                        Open
                      </Button>
                    ) : null}

                    {!notification.is_read ? (
                      <Button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleMarkRead(notification.id);
                        }}
                        disabled={pendingId === `read-${notification.id}`}
                        className="ui-compact-button"
                      >
                        {pendingId === `read-${notification.id}` ? "Saving..." : "Mark Read"}
                      </Button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </SurfaceCard>

      <div className="text-sm text-secondary">
        <Link to={fallbackPath} className="font-medium text-ink underline-offset-4 hover:underline">
          Return to workspace
        </Link>
      </div>
    </div>
  );
}

export default NotificationsPage;
