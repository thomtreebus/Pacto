import React, { useState } from "react";
import { Box } from "@mui/material"
import FirstTab from "../AllTabs/FirstTab";
import SecondTab from "../AllTabs/SecondTab";
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

import { useHistory } from "react-router-dom";
import ErrorMessage from "../ErrorMessage";
import { maxWidth } from "@mui/system";

export default function UserPortfolio({user}){
	const [activeTab, setActiveTab] = useState("tab1");

	// const handleTab1 = () => {
	// 	// update the state to tab1
	// 	setActiveTab("tab1");
	//   };
	//   const handleTab2 = () => {
	// 	// update the state to tab2
	// 	setActiveTab("tab2");
	// };

	const [list, setList] = React.useState("all");


	const handleChange = (list, newList) => {
		setList(newList);
	};

	return (
		<Box
			sx={{
				width: "80%",
				height: "auto",
				minHeight: "75px",
				background: "#007FFF",
				margin: "3.5rem auto 1.5rem",
				padding: "2rem 1 rem",
				color: "#E8F0F2",
				borderRadius: "2rem",
				display: "flex",
				justifyContent: "center",
				alignItems: "top",
			}}		
		>
			<div className="Tabs">
				{/* Tab nav
				<ul className="nav">
					<li 
						className={activeTab === "tab1" ? "active" : ""}
						onClick={ handleTab1 }
					>
						Friends
					</li>
					<li 
						className={activeTab === "tab2" ? "active" : ""}
						onClick={ handleTab2 }
					>
						All
					</li>
				</ul>
				<div className="outlet">
					{activeTab === "tab1" ? <FirstTab /> : <SecondTab />}
				</div> */}

				<Box
					sx={{
						maxWidth: "100%",
						marginInline: "auto",
					}}
					width={{ xs: "0px", lg: "100%" }}
					height={{ xs: "10px", lg: "100%" }}
				>
					<TabContext value={list}>
						<Box
							sx={{
								borderBottom: 1,
								marginBottom: "10px",
								borderColor: "divider",
							}}
						>
							<TabList onChange={handleChange} aria-label="lab API tabs example">
								<Tab label="All" value="all" />
								<Tab label="Friends" value="friends" />
							</TabList>
					</Box>
					<TabPanel value="all">All list</TabPanel>
        			<TabPanel value="friends">Friends list</TabPanel>
				</TabContext>
			</Box>
			</div>
		</Box>
	);
}
