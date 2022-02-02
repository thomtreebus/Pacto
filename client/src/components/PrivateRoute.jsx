import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

const PrivateRoute = ({ children, ...rest }) => {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return <Redirect to="/login" />;
	}

	return <Route {...rest}>{children}</Route>;
};

export default PrivateRoute;
