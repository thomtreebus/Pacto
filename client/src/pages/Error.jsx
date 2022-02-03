import { Box, Typography } from "@mui/material";
import React, { useEffect } from "react";

export default function Loading({ error }) {
	useEffect(() => {
		console.error(error);
	}, []);

	return (
		<Box
			sx={{
				width: "100%",
				height: "100vh",
				backgroundColor: "#007FFF",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<Typography variant="h4" color="white">
				Something went wrong the server or database may currently be down
			</Typography>
			<h1 hidden>Error: {error}</h1>
		</Box>
	);
}
