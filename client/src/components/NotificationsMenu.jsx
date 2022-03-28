import Menu from "@mui/material/Menu";
import NotificationCard from "./NotificationCard";
import { Typography } from "@mui/material";

export default function NotificationsMenu({
	limit = 5,
	notificationsMenuId,
	notificationsAnchorEl,
	handleNotificationsMenuClose,
	isNotificationsMenuOpen,
	notifications,
	setNotifications,
}) {
	return (
		<Menu
			sx={{ padding: 2 }}
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
			{notifications
				.slice(0, limit < notifications.length ? limit : notifications.length)
				.map((notification) => (
					<NotificationCard
						key={notification._id}
						notification={notification}
						notifications={notifications}
						setNotifications={setNotifications}
					/>
				))}
			<Typography variant="subtitle1" sx={{ textAlign: "center", margin: 1 }}>
				<span>
					{limit >= notifications.length
						? "No more unread notifications..."
						: `+ ${notifications.length - limit} more unread`}
				</span>
			</Typography>
		</Menu>
	);
}
