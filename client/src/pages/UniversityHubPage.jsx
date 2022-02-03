import { Box, Typography, TextField, Grid } from "@mui/material";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import { useState } from "react";
import background from "../assets/hub-background.jpg";
import { Divider } from "@mui/material";
import PactCard from "../components/PactCard";

export default function UniversityHubPage() {
	const [category, setCategory] = useState("all");

	const tempPacts = [
		{
			name: "Pact1",
			description: "No description provided",
			category: "subjects",
			tags: ["apple", "ball"],
			members: ["jeff", "jhon"],
		},
		{
			name: "Pact2",
			description: "description retracted",
			category: "courses",
			tags: ["cat", "dog"],
			members: ["jane"],
		},
		{
			name: "Pact3",
			description: "No description provided",
			category: "other",
			tags: ["elephant", "fish"],
			members: ["alice", "bob", "charlie"],
		},
		{
			name: "Pact1",
			description: "No description provided",
			category: "subjects",
			tags: ["apple", "ball"],
			members: ["jeff", "jhon"],
		},
		{
			name: "Pact2",
			description: "description retracted",
			category: "courses",
			tags: ["cat", "dog"],
			members: ["jane"],
		},
		{
			name: "Pact3",
			description: "No description provided",
			category: "other",
			tags: ["elephant", "fish"],
			members: ["alice", "bob", "charlie"],
		},
		{
			name: "Pact1",
			description: "No description provided",
			category: "subjects",
			tags: ["apple", "ball"],
			members: ["jeff", "jhon"],
		},
		{
			name: "Pact2",
			description: "description retracted",
			category: "courses",
			tags: ["cat", "dog"],
			members: ["jane"],
		},
		{
			name: "Pact3",
			description: "No description provided",
			category: "other",
			tags: ["elephant", "fish"],
			members: ["alice", "bob", "charlie"],
		},
	];

	const handleChange = (category, newCategory) => {
		setCategory(newCategory);
	};

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
					textShadow: "1px 1px grey",
					color: "white",
				}}
			>
				<Typography variant="h3" sx={{ fontWeight: "bold" }}>
					Find your pact
				</Typography>
				<Typography variant="h5" sx={{ fontWeight: "bold" }}>
					There's a pact for everything if not make one...
				</Typography>
				<TextField
					id="outlined-basic"
					label="Search"
					variant="filled"
					size="small"
					sx={{
						backgroundColor: "white",
						textShadow: "none",
						margin: "10px",
						width: "300px",
						borderRadius: "5px",
						overflow: "hidden",
					}}
				/>
			</Box>
			<Divider sx={{ marginTop: "15px" }} />
			<Box>
				<TabContext value={category}>
					<Box
						sx={{
							borderBottom: 1,
							marginBottom: "10px",
							borderColor: "divider",
						}}
					>
						<TabList onChange={handleChange} aria-label="lab API tabs example">
							<Tab label="All" value="all" />
							<Tab label="Subjects" value="subjects" />
							<Tab label="Modules" value="modules" />
							<Tab label="Other" value="other" />
						</TabList>
					</Box>
				</TabContext>
			</Box>
			<Grid container spacing={2}>
				{tempPacts.map((pact) => (
					<PactCard
						pact={pact}
						id={pact}
						joined={Math.floor(Math.random() * 10) > 4}
					/>
				))}
			</Grid>
		</Box>
	);
}
