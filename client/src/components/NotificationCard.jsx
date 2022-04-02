/**
 * The card which displays a singular notification
 */

import { Card, Typography } from "@mui/material";
import { useState } from "react";
import { relativeTime } from "../helpers/timeHandler";
import { IconButton } from "@mui/material";
import MarkChatReadIcon from "@mui/icons-material/MarkChatRead";

/**
 * Displays a single notification
 * @param {Object} notification The notification to be displayed
 * @param {Array} notifications A list of all notifications
 * @param {function} setNotifications A state setter, used to remove this notification when it's dismissed
 */
function NotificationCard({ notification, notifications, setNotifications }) {
	const [buttonIsDisabled, setIsButtonDisabled] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const deleteNotification = async () => {
		setIsButtonDisabled(true);

		try {
			const response = await fetch(
				`${process.env.REACT_APP_URL}/notifications/${notification._id}/update`,
				{
					method: "PUT",
					credentials: "include",
				}
			);
			const json = await response.json();
			if (json.errors.length) throw Error(json.errors[0].message);

			const newNotifications = notifications.filter((notificationToBeDeleted) => {
				return notificationToBeDeleted._id !== notification._id;
			});
			setNotifications(newNotifications);
		} catch (err) {
			setIsError(true);
			setErrorMessage(err.message);
			setIsButtonDisabled(false);
		}
	};

	return (
		<>
			<Card data-testid={`notification-card-${notification._id}`} sx={{ maxWidth: "18rem", padding: 2, margin: 1, shadow: 3 }}>
				<IconButton
					color={isError ? "secondary" : "primary"}
					aria-label="open drawer"
					edge="start"
					disabled={buttonIsDisabled}
					onClick={deleteNotification}
					data-testid={`mark-notification-as-read-${notification._id}`}
				>
					<MarkChatReadIcon />
				</IconButton>
				{isError && (
					<Typography data-testid={`error-message-${notification._id}`} variant="body1" color="secondary">
						{errorMessage}
					</Typography>
				)}
				<Typography>{notification.text}</Typography>
				<Typography variant="caption">
					{relativeTime(notification.time)}
				</Typography>
			</Card>
		</>
	);
}

export default NotificationCard;
