/**
 * Tests for the popular pacts list component.
 */

 import { screen } from "@testing-library/react";
 import { waitForElementToBeRemoved } from "@testing-library/react";
 import "@testing-library/jest-dom";
 import { rest } from "msw";
 import pacts from "./utils/testPacts";
 import PopularPactsList from "../components/PopularPactsList";
 import { useMockServer } from "./utils/useMockServer";
 import mockRender from "./utils/mockRender";
 
 const user = {
	 pacts: [],
	 firstName: "pac",
	 lastName: "to",
	 image:
		 "https://res.cloudinary.com/djlwzi9br/image/upload/v1644581875/man1_qexxnb.jpg",
	 _id: "1",
 };
 
 describe("Popular Pact List tests", () => {
	 const server = useMockServer();
 
	 beforeEach(async () => {
		 server.use(
			 rest.get(`${process.env.REACT_APP_URL}/me`, (req, res, ctx) => {
				 return res(
					 ctx.json({
						 message: user,
						 errors: [],
					 })
				 );
			 }),
			 rest.get(`${process.env.REACT_APP_URL}/university`, (req, res, ctx) => {
				 return res(
					 ctx.json({
						 message: { pacts: pacts },
						 errors: [],
					 })
				 );
			 })
		 );
	 });
 
	 it("shows the pact with the most memebers first", async () => {
		 await mockRender(<PopularPactsList />);
		 await waitForElementToBeRemoved(() => screen.getByText("Loading Pacts..."));
		 const items = screen.getAllByTestId("item");
		 expect(items[0].textContent).toBe(pacts[3].name);
	 });
 });
 