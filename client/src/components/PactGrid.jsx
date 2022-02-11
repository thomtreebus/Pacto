import React from "react";
import PactCard from "../components/PactCard";
import { Grid, Typography } from "@mui/material";
import { useAuth } from "../providers/AuthProvider";

export default function PactGrid({ pacts }) {
	const { user } = useAuth();

	if (pacts.length === 0) {
		return (
			<Typography variant="subtitle2" sx={{ fontSize: "1.5rem" }}>
				The are currently no pacts avaliable
			</Typography>
		);
	}

	return (
		<Grid container spacing={2}>
			{pacts.map((pact, index) => (
				<PactCard
					pact={pact}
					key={index}
					joined={pact.members.includes(user._id)}
				/>
			))}
		</Grid>
	);
}
