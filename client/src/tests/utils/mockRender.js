/**
 * A helper file conatining the render mock function. This helps
 * facilitate the rendering of constructed mock components from the
 * test files.
 */

import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";
import { waitForElementToBeRemoved } from "@testing-library/react";
import MockComponent from "./MockComponent";
import { render, screen } from "@testing-library/react";

/**
 * Renders the component wrapped in the MockCoponents and can be awaited
 * so that execution is blocked until after the component has finished loading.
 *
 * @param element The element we want to render within the MockComponent.
 * @param startingPath The starting path on which the element should render on.
 * @returns An object containing the history of the pathnames the component has been through.
 */
const mockRender = async (element, startingPath = "/") => {
	const history = createMemoryHistory({ initialEntries: [`${startingPath}`] });
	render(
		<MockComponent>
			<Router history={history}>{element}</Router>
		</MockComponent>
	);
	await waitForElementToBeRemoved(() => screen.getByText("Loading"));
	return history;
};

export default mockRender;
