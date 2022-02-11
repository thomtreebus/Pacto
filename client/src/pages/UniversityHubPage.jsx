import { Box, Typography, Card, Fab } from "@mui/material";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import { useState } from "react";
import background from "../assets/hub-background.jpg";
import { Divider } from "@mui/material";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { useHistory } from "react-router-dom";
import PactGrid from "../components/PactGrid";
import { useQuery } from "react-query";
import Loading from "./Loading";
import { useEffect } from "react";

export default function UniversityHubPage() {
	const { isLoading, data } = useQuery("repoData", () =>
		fetch(`${process.env.REACT_APP_URL}/university`, {
			credentials: "include",
		}).then((res) => res.json())
	);

	const [pacts, setPacts] = useState([]);
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState("all");
	const history = useHistory();

	const handleChange = (category, newCategory) => {
		setCategory(newCategory);
	};

	useEffect(() => {
		if (data) {
			setPacts(
				data.message.pacts.filter(
					(pact) =>
						(category === "all" ? true : pact.category === category) &&
						pact.name.toLowerCase().includes(search)
				)
			);
		}
	}, [data, category, search]);

	if (isLoading) {
		return <Loading />;
	}

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
					borderRadius: "25px",
					boxShadow: 2,
					marginInline: "auto",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
					textShadow: "1px 1.5px #1a237e",
					color: "white",
				}}
			>
				<Typography variant="h3" sx={{ fontWeight: "bold" }}>
					Find your pact
				</Typography>
				<Typography variant="h5" sx={{ fontWeight: "bold" }}>
					There's a pact for everything if not, make one...
				</Typography>
				<Card
					sx={{
						p: "2px 4px",
						marginTop: "10px",
						display: "flex",
						alignItems: "center",
						width: 400,
					}}
				>
					<InputBase
						sx={{ ml: 1, flex: 1 }}
						placeholder="Search Pacts"
						value={search}
						onChange={(e) => setSearch(e.target.value.toLowerCase())}
					/>
					<IconButton
						sx={{ p: "10px" }}
						disabled={!search}
						color="primary"
						onClick={() => setSearch("")}
						data-testid="search-button"
					>
						{search ? (
							<CloseIcon data-testid="clear-icon" />
						) : (
							<SearchIcon data-testid="search-icon" />
						)}
					</IconButton>
				</Card>
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
							<Tab label="Courses" value="course" />
							<Tab label="Modules" value="module" />
							<Tab label="Societies" value="society" />
							<Tab label="Other" value="other" />
						</TabList>
					</Box>
				</TabContext>
			</Box>
			<PactGrid pacts={pacts} />
			<Fab
				aria-label="add"
				sx={{ position: "absolute", top: 75, right: 250 }}
				onClick={() => history.push("/create-pact")}
				data-testid="floating-action-button"
			>
				<AddIcon />
			</Fab>
		</Box>
	);
}
