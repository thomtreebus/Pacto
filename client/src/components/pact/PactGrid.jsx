/**
 * A grid which contains pact cards of all pacts in the uni
 */

import React from "react";
import PactCard from "../cards/PactCard";
import { Grid, Typography } from "@mui/material";
import { useAuth } from "../../providers/AuthProvider";

/**
 * A grid displaying pact cards
 * @param {Array} pacts List of pacts
 */
export default function PactGrid({ pacts }) {
	const { user } = useAuth();

	if (pacts.length === 0) {
		return (
			<Typography variant="subtitle1" sx={{ textAlign: "center" }}>
				The are currently no pacts available
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
