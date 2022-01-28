import React from "react";
import { Route, Redirect } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import { useAuth } from "../providers/AuthProvider";

const PrivateRoute = ({ children, ...rest }) => {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return <LoginPage />;
	}

	return <Route {...rest}>{children}</Route>;
};

export default PrivateRoute;
