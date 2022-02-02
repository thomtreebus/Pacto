import { Box, Typography } from "@mui/material";
import React from "react";
import background from "../assets/hub-background.svg";

export default function UniversityHubPage() {
	return (
		<Box
			sx={{
				padding: 2,
				width: "100%",
			}}
		>
			<Box
				sx={{
					width: "100%",
					height: "35vh",
					backgroundImage: `url(${background})`,
					backgroundRepeat: "no-repeat",
					backgroundPosition: "center",
					backgroundSize: "cover",
					maxWidth: "1300px",
					borderRadius: "25px",
					boxShadow: 2,
					marginInline: "auto",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
					textShadow: "1px 2px #007FFF",
					color: "white",
				}}
			>
				<Typography variant="h3" sx={{ fontWeight: "bold" }}>
					Find your pact
				</Typography>
				<Typography variant="h5" sx={{ fontWeight: "bold" }}>
					There's a pact for everything if not make one...
				</Typography>
			</Box>
		</Box>
	);
}
