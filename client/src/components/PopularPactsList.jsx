import React, { useEffect } from "react";
import List from "@mui/material/List";
import { useQuery } from "react-query";
import PactList from "./PactList";
import { useAuth } from "../providers/AuthProvider";
import { Typography } from "@mui/material";

/**
 * List of pacts to be show on sidebar that the user isn't part of
 * @param {number} numberOfPacts The maximum number of pacts to be shown
 */
export default function PopularPactsList({ numberOfPacts = 3 }) {
	const { isLoading, data, refetch } = useQuery("popularpacts", () =>
		fetch(`${process.env.REACT_APP_URL}/university`, {
			credentials: "include",
		}).then((res) =>  res.json(), { enabled: false })
	);

	const { user } = useAuth();

	useEffect(() => {
		refetch();
	}, [user, refetch]);

	if (isLoading) {
		return (
			<Typography variant="subtitle1" sx={{ textAlign: "center" }}>
				Loading Pacts...
			</Typography>
		);
	}

	return (
		<List>
			<PactList
				pacts={data.message.pacts
					.filter((pact) => !pact.members.includes(user._id))
					.sort((a, b) => b.members.length - a.members.length)
					.slice(0, numberOfPacts)}
			/>
		</List>
	);
}
