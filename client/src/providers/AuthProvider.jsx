import React, { useContext, useState, useEffect } from "react";
import Loading from "../pages/Loading";
import Error from "../pages/Error";

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

	async function fetchUser() {
		setIsLoading(true);
		try {
			const response = await fetch(`${process.env.REACT_APP_URL}/me`, {
				credentials: "include",
			});
			const data = await response.json();

			if (data.errors.length) {
				setUser(null);
				setIsAuthenticated(false);
			} else {
				setError(null);
				setUser(data.message);
				setIsAuthenticated(true);
			}
		} catch (err) {
			setError(err.message);
			setUser(null);
			setIsAuthenticated(false);
		}
		setIsLoading(false);
	}

	useEffect(() => {
		fetchUser();
		return () => {
			setUser(null);
			setError(null);
			setIsLoading(true); //This might need to be set to false.
			setIsAuthenticated(false);
		};
	}, []);

	if (isLoading) {
		return <Loading />;
	}

	if (error) {
		return <Error error={error} />;
	}

	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated,
				setIsAuthenticated,
				setUser,
				activePage,
				setActivePage,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
