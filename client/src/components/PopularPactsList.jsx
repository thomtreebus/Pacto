import React from "react";
import List from "@mui/material/List";
import { useQuery } from "react-query";
import PactList from "./PactList";

export default function MyPactList({ numberOfPacts = 3 }) {
	const { isLoading, data } = useQuery("popularpacts", () =>
		fetch(`${process.env.REACT_APP_URL}/university`, {
			credentials: "include",
		}).then((res) => res.json())
	);

	if (isLoading) {
		return "Loading Pacts...";
	}

	return (
		<List>
			<PactList
				pacts={data.message.pacts
					.sort((a, b) => b.members.length - a.members.length)
					.slice(0, numberOfPacts)}
			/>
		</List>
	);
}
