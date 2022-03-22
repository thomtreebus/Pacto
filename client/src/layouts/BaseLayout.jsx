import React from "react";
import LeftSideBar from "../components/LeftSideBar";
import RightSideBar from "../components/RightSideBar";
import Box from "@mui/material/Box";

export default function BaseLayout({ children }) {
	document.body.style = "background-color: #edf6ff";
	return (
		<>
			<Box sx={{ display: "flex", alignItems: "center", maxWidth: "100%" }}>
				<LeftSideBar />
				<Box
					sx={{
						my: 8,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						flex: "1",
					}}
				>
					{children}
				</Box>
				<RightSideBar />
			</Box>
		</>
	);
}
