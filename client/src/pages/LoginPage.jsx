import React, { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import { Link, useHistory } from "react-router-dom";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Icon from "../assets/pacto-logo.ico";
import Typography from "@mui/material/Typography";
import { useAuth } from "../providers/AuthProvider";
import ErrorMessage from "../components/ErrorMessage";

export default function LoginPage() {
	const { silentUserRefresh } = useAuth();
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState(null);
	const [isButtonDisabled, setIsButtonDisabled] = useState(false);
	const history = useHistory();

	const handleSubmit = async (event) => {
		event.preventDefault();
		setIsButtonDisabled(true);
		const data = new FormData(event.currentTarget);

		try {
			const response = await fetch(`${process.env.REACT_APP_URL}/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					uniEmail: data.get("email"),
					password: data.get("password"),
				}),
			});

			const json = await response.json();

			if (response.status !== 200) {
				setSnackbarMessage(json.errors[0].message);
				setSnackbarOpen(true);
				setIsButtonDisabled(false);
				return;
			}

			await silentUserRefresh();
			history.push("/feed");
		} catch (err) {
			setSnackbarMessage(err.message);
			setSnackbarOpen(true);
			setIsButtonDisabled(false);
			return;
		}
	};

	return (
		<>
			<Grid container component="main" sx={{ height: "100vh" }}>
				<CssBaseline />
				<Grid
					item
					data-testid="background-login-image"
					xs={false}
					sm={4}
					md={7}
					sx={{
						backgroundImage:
							"url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80)",
						backgroundRepeat: "no-repeat",
						backgroundColor: (t) => t.palette.grey[50],
						backgroundSize: "cover",
						backgroundPosition: "center",
						filter: "blur(3px)",
					}}
				/>
				<Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
					<Box
						sx={{
							my: 8,
							mx: 4,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
						}}
					>
						<Avatar alt="Pacto Icon" src={Icon} />

						<Typography component="h1" variant="h5" sx={{ fontWeight: "bold" }}>
							Sign In
						</Typography>
						<Box
							component="form"
							noValidate
							onSubmit={handleSubmit}
							sx={{ mt: 1 }}
						>
							<TextField
								margin="normal"
								required
								fullWidth
								label="Email Address"
								name="email"
								autoComplete="email"
								autoFocus
							/>
							<TextField
								margin="normal"
								required
								fullWidth
								name="password"
								label="Password"
								type="password"
								autoComplete="current-password"
								data-testid="password-input"
							/>
							<Button
								type="submit"
								fullWidth
								variant="contained"
								disabled={isButtonDisabled}
								sx={{ mt: 3, mb: 2 }}
							>
								Sign In
							</Button>
							<Grid container>
								<Grid item>
									<Link to="/signup" variant="body2">
										Don't have an account? Sign Up
									</Link>
								</Grid>
							</Grid>
						</Box>
					</Box>
				</Grid>
			</Grid>

			<ErrorMessage
				isOpen={snackbarOpen}
				setIsOpen={setSnackbarOpen}
				message={snackbarMessage}
			/>
		</>
	);
}
