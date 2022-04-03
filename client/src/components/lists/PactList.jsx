/**
 * A component to render a list of pacts
 */

import React from "react";
import { Typography } from "@mui/material";
import PactListItem from "./items/PactListItem";

/**
 * Renders a list of pacts
 * @param {Array} pacts A list of Pact documents
 */
export default function PactList({ pacts }) {
	if (!pacts.length) {
		return (
			<Typography variant="subtitle1" sx={{ textAlign: "center" }}>
				No more pacts
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
