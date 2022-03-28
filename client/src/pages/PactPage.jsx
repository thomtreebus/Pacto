import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loading from "./Loading";
import { useHistory } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import PactPageFeedTab from "../components/PactPage/PactPageFeedTab";
import { a11yProps, TabPanel } from "../components/TabComponents";
import PactMembersTab from "../components/PactPage/PactMembersTab";
import { Box } from "@mui/material";

export default function PactPage() {
	const { pactID } = useParams();
	const [pact, setPact] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	const history = useHistory();
	const { user } = useAuth();

	const [mainPactTabValue, setMainPactTabValue] = useState(0);

	const handleMainPactTabChange = (event, newValue) => {
		setMainPactTabValue(newValue);
	};

	useEffect(() => {
		setIsLoading(true);
		const controller = new AbortController();

		fetch(`${process.env.REACT_APP_URL}/pact/${pactID}`, {
			method: "GET",
			credentials: "include",
			signal: controller.signal,
		})
			.then((res) => {
				if (!res.ok) {
					throw Error("Could not fetch pact");
				}
				return res.json();
			})
			.then((data) => {
				setPact(data.message);
				setIsLoading(false);
			})
			.catch((err) => {
				if (err.message === "The user aborted a request.") return;
				if (err.message === "Could not fetch pact") {
					history.push("/not-found");
				}
			});

		return () => controller.abort();
	}, [pactID, history, user]);

	if (isLoading) {
		return (
			<>
				<Loading />
			</>
		);
	}

	return (
		<Box sx={{ width: "100%" }}>
			<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
				<Tabs
					value={mainPactTabValue}
					onChange={handleMainPactTabChange}
					aria-label="User type tab"
				>
					<Tab label="Pact Posts" {...a11yProps(0)} />
					<Tab label="Pact Members" {...a11yProps(1)} />
				</Tabs>
			</Box>
			<TabPanel value={mainPactTabValue} index={0}>
				<PactPageFeedTab pact={pact} />
			</TabPanel>
			<TabPanel value={mainPactTabValue} index={1}>
				<PactMembersTab pact={pact} />
			</TabPanel>
		</Box>
	);
}
