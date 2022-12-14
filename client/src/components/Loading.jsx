/**
 * Displays the loading page when a page is loading
 */

import { Box, CircularProgress } from "@mui/material";
import React from "react";

/**
 * Component showing a spinning circle
 * @returns {JSX.Element}
 */
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
