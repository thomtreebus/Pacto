import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";
import { waitForElementToBeRemoved } from "@testing-library/react";
import MockComponent from "./MockComponent";
import { render, screen } from "@testing-library/react";

const mockRender = async (element, startingPath = "/") => {
	const history = createMemoryHistory({ initialEntries: [`${startingPath}`] });
	render(
		<MockComponent>
			<Router history={history}>
				{element}				
			</Router>
		</MockComponent>
	);
	await waitForElementToBeRemoved(() => screen.getByText("Loading"));
	return history;
};

export default mockRender;