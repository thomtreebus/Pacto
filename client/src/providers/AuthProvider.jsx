import React, { useContext, useState, useEffect, useCallback } from "react";
import Loading from "../pages/Loading";
import ErrorPage from "../pages/Error";

const AuthContext = React.createContext();

export function useAuth() {
	return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [error, setError] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [activePage, setActivePage] = useState("/feed");

	const silentUserRefresh = useCallback(() => {
		return fetch(`${process.env.REACT_APP_URL}/me`, {
			credentials: "include",
		}).then((res) => {
			if (!res.ok) {
				throw Error(res.errors);
			}
			return res.json();
		}).then((data) => {
			setError(null);
			setUser(data.message);
			setIsAuthenticated(true);
		}).catch((err) => {
			setError(err.message);
			setUser(null);
			setIsAuthenticated(false);
		})
	}, [])

	const fetchUser = useCallback(async () => {
		setIsLoading(true);
		await silentUserRefresh();
		setIsLoading(false);
	}, [silentUserRefresh])

	useEffect(() => {
		fetchUser();
		return () => {
			setUser(null);
			setError(null);
			setIsLoading(true); //This might need to be set to false.
			setIsAuthenticated(false);
		};
	}, [fetchUser]);

	if (isLoading) {
		return <Loading />;
	}

	if (error) {
		return <ErrorPage error={error} />;
	}

	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated,
				silentUserRefresh,
				activePage,
				setActivePage,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
