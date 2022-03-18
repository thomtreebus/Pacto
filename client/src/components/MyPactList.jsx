import React from "react";
import List from "@mui/material/List";
import { useAuth } from "../providers/AuthProvider";
import { useQuery } from "react-query";
import PactList from "./PactList";

export default function MyPactList() {
	const { isLoading, data } = useQuery("mypacts", () =>
		fetch(`${process.env.REACT_APP_URL}/university`, {
			credentials: "include",
		}).then((res) => res.json())
	);

	const { user } = useAuth();

	if (isLoading) {
		return "Loading Pacts...";
	}

	return (
		<List>
			<PactList
				pacts={data.message.pacts.filter((pact) =>
					user.pacts.includes(pact._id)
				)}
			/>
		</List>
	);
}
