import React, { useEffect } from "react";
import List from "@mui/material/List";
import { useQuery } from "react-query";
import PactList from "./PactList";
import { useAuth } from "../providers/AuthProvider";

export default function MyPactList({ numberOfPacts = 3 }) {
	const { isLoading, data, refetch } = useQuery("popularpacts", () =>
		fetch(`${process.env.REACT_APP_URL}/university`, {
			credentials: "include",
		}).then((res) => res.json(), {enabled : false})
	);

	const { user } = useAuth();

	useEffect(() => {
		refetch();
	}, [user, refetch])

	if (isLoading) {
		return "Loading Pacts...";
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
