import Menu from '@mui/material/Menu';
import NotificationCard from "./NotificationCard";
import { Typography } from '@mui/material';

export default function NotificationsMenu({ limit = 5, notificationsMenuId, notificationsAnchorEl, handleNotificationsMenuClose, isNotificationsMenuOpen, notifications}) {
  
  if (!notifications?.length) {
    return (
    <Typography variant="subtitle1" sx={{ textAlign: "center" }}>
      No unread notifications...
    </Typography>
    )
  }
  
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
      {/* {notifications.length > limit */}


      {notifications.map((notification) => (
        <NotificationCard key={notification._id} notification={notification} />
      ))}
    </Menu>
  );
}