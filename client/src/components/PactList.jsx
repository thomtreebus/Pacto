import React from "react";
import { Typography } from "@mui/material";
import PactListItem from "./PactListItem";

export default function PactList({ pacts }) {
	if (!pacts.length) {
		return (
			<Typography variant="subtitle1" sx={{ textAlign: "center" }}>
				You are not in any pacts
			</Typography>
		);
	}

	return (
		<div>
			{pacts.map((pact) => (
				<PactListItem pact={pact} key={pact._id} />
			))}
		</div>
	);
}
