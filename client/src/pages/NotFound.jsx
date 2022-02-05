import React from "react";
import { Card, Typography } from "@mui/material";

export default function Notfound() {
	return (
		<Card
			sx={{
				padding: "200px 20px",
				margin: "auto",
				transform: "translateY(128px)",
			}}
		>
			<Typography variant="h4">
				The Page you are looking for was not found
			</Typography>
		</Card>
	);
}
