import { Card, Typography } from "@mui/material";
import { useState } from "react";
import { relativeTime } from "../helpers/timeHandllers";
import { IconButton } from "@mui/material";
import MarkChatReadIcon from "@mui/icons-material/MarkChatRead";
import ErrorMessage from "./ErrorMessage";

function NotificationCard({ notification, notifications, setNotifications }) {
	const [buttonIsDisabled, setIsButtonDisabled] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const deleteNotification = async () => {
		setIsButtonDisabled(true);

		const response = await fetch(
			`${process.env.REACT_APP_URL}/notifications/${notification._id}/update`,
			{
				method: "PUT",
				credentials: "include",
			}
		);

		try {
			const json = await response.json();
			console.log(json);
			if (json.errors.length) throw Error(json.errors[0].message);
		} catch (err) {
			setIsError(true);
			setErrorMessage(err.message);
			setIsButtonDisabled(false);
			return;
		}

		const newNotifications = notifications.filter((notificationToBeDeleted) => {
			return notificationToBeDeleted._id !== notification._id;
		});
		setNotifications(newNotifications);
	};

	return (
		<>
			<ErrorMessage
				isOpen={isError}
				setIsOpen={setIsError}
				message={errorMessage}
			/>

			<Card sx={{ maxWidth: "18rem", padding: 2, margin: 1, shadow: 3 }}>
				<IconButton
					color="inherit"
					aria-label="open drawer"
					edge="start"
					disabled={buttonIsDisabled}
					onClick={deleteNotification}
					data-testid="mark-notification-as-read"
				>
					<MarkChatReadIcon />
				</IconButton>
				<Typography>{notification.text}</Typography>
				<Typography variant="caption">
					{relativeTime(notification.time)}
				</Typography>
			</Card>
		</>
	);
}

export default NotificationCard;
