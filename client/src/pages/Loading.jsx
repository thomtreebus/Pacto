import { Box, LinearProgress, CircularProgress } from "@mui/material";
import React from "react";

export default function Loading() {
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
			<CircularProgress sx={{ color: "white" }} />
			<h1 hidden>Loading</h1>
		</Box>
	);
}
