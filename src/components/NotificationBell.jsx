import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import api from "../services/base";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
    
    // Set up polling to check notifications every minute
    const intervalId = setInterval(fetchNotifications, 60000);
    return () => clearInterval(intervalId);
  }, []);
  
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users/notifications');
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.seen).length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleNotificationClick = async (notification) => {
    // Mark notification as seen
    if (!notification.seen) {
      try {
        await api.put(`/users/notifications/${notification.id}/seen`);
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, seen: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark notification as seen:', err);
      }
    }
    
    // Handle notification based on type
    if (notification.type === 'PLAN_EXPIRED' || notification.type === 'PLAN_EXPIRING') {
      navigate('/payment');
    }
  };
  
  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
        <div className="indicator">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="badge badge-sm badge-primary indicator-item">{unreadCount}</span>
          )}
        </div>
      </div>
      <div tabIndex={0} className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-80 max-h-96 overflow-y-auto">
        <div className="p-2 font-bold border-b border-base-300">Notifications</div>
        {loading ? (
          <div className="flex justify-center p-4">
            <span className="loading loading-spinner loading-sm"></span>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`p-2 border-b border-base-200 cursor-pointer hover:bg-base-200 ${!notification.seen ? 'bg-base-200' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="font-semibold text-sm">
                {notification.type === 'PLAN_EXPIRED' && '❗ Plan Expired'}
                {notification.type === 'PLAN_EXPIRING' && '⚠️ Plan Expiring Soon'}
              </div>
              <div className="text-xs text-base-content/70">{notification.message}</div>
              <div className="text-xs text-base-content/50 mt-1">
                {new Date(notification.created_at).toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-sm text-base-content/70">
            No notifications
          </div>
        )}
      </div>
    </div>
  );
}