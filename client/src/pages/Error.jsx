/**
 * A page that displays the error message if an error is encountered
 */

import { Box, Typography } from "@mui/material";
import React from "react";

/**
 * A page that displays the error message if an error is encountered
 * @param {string} error 
 */
export default function Error({ error }) {
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
