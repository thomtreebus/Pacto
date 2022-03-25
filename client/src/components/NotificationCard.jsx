import { Card, Typography } from "@mui/material";

const vagueTime = require("vague-time");

export default function NotificationCard({ notification }){
	return (
		<Card sx={{ width: '300px', padding: '20px', marginTop: '2px'}}>
			<Typography>
				{notification.text}
			</Typography>
			<Typography variant="caption">
				{vagueTime.get({from: Date.now(), to: new Date(notification.time)})}
			</Typography>
		</Card>
	)
}