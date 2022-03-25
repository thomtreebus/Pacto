import { Card, Typography } from "@mui/material";
export default function NotificationCard({ notification }){
	console.log(notification)
	return (
		<Card sx={{ width: '300px', padding: '100', marginTop: '18px'}}>
			<Typography>
				{notification.text}
			</Typography>
		</Card>
	)
}