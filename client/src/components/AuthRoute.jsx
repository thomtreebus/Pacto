import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

/**
 * A route meant to be used for only unauthorized users
 * @param children The children of this route
 * @param rest Props for the route
 */
const AuthRoute = ({ children, ...rest }) => {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return <Route {...rest}>{children}</Route>;
	}

	return <Redirect to="/feed" />;
};

export default AuthRoute;
