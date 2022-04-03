/**
 * A helper file to isolate the creation of MockComponents.
 */

import React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import AuthProvider from "../../providers/AuthProvider";

export const queryClient = new QueryClient();

/**
 * Wraps the component in the library prerequisites like the router
 * and the providers.
 *
 * @param children The element that you would like to wrap in the library prerequisites.
 * @returns The component wrapped in the library prerequisites.
 */
const MockComponent = ({ children }) => {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<BrowserRouter>{children}</BrowserRouter>
			</AuthProvider>
		</QueryClientProvider>
	);
};

export default MockComponent;
