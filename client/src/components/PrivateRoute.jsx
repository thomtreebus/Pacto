/**
 * A route designed to permit only authorized users to
 * visit the specified url
 */

import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

/**
 * A route meant to be used for only authorized users
 * @param children The children of this route
 * @param rest Props for the route
 */
const PrivateRoute = ({ children, ...rest }) => {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return <Redirect to="/login" />;
	}

	return <Route {...rest}>{children}</Route>;
};

export default PrivateRoute;
