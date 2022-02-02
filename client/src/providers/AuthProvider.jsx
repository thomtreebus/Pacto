import React, { useContext, useState, useEffect } from "react";

const AuthContext = React.createContext();

export function useAuth() {
	return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [error, setError] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

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
		return <h1>Loading</h1>;
	}

	if (error) {
		return <h1>Error: {error}</h1>;
	}

	return (
		<AuthContext.Provider
			value={{ user, isAuthenticated, setIsAuthenticated, setUser }}
		>
			{children}
		</AuthContext.Provider>
	);
}
