import React from "react";
import { Route, Redirect } from "react-router-dom";
import Feed from "../pages/Feed";
import { useAuth } from "../providers/AuthProvider";

const AuthRoute = ({ children, ...rest }) => {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return <Route {...rest}>{children}</Route>;
	}

	return <Feed />;
};

export default AuthRoute;
