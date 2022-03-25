import Menu from '@mui/material/Menu';
import NotificationCard from "./NotificationCard";

export default function NotificationsMenu({notificationsMenuId, notificationsAnchorEl, handleNotificationsMenuClose, isNotificationsMenuOpen, notifications}) {
  if (!notifications) return <></>
  return (
  <Menu
    data-testid={notificationsMenuId}
    anchorEl={notificationsAnchorEl}
    anchorOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    id={notificationsMenuId}
    keepMounted
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    open={isNotificationsMenuOpen}
    onClose={handleNotificationsMenuClose}
  >
    {notifications.map((notification) => (
      <NotificationCard key={notification._id} notification={notification} />
    ))}
  </Menu>)
}