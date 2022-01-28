import React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import AuthProvider from "../../providers/AuthProvider";

const queryClient = new QueryClient();

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
