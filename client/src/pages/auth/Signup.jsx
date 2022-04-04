/**
 * Allows the user to sign up to the application with valid credentials
 */

import React, { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Link, useHistory } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Icon from "../../assets/pacto-logo.ico";
import { AlertTitle, Alert } from "@mui/material";

/**
 * Signup page takes user's name and email along with
 * their password to create an account and send a
 * verification email.
 * @returns {JSX.Element}
 */
export default function Signup() {
	const [passwordConfirmError, setPasswordConfirmError] = useState("");
	const [apiFirstNameError, setApiFirstNameError] = useState("");
	const [apiLastNameError, setApiLastNameError] = useState("");
	const [apiUniEmailError, setApiUniEmailError] = useState("");
	const [apiPasswordError, setApiPasswordError] = useState("");
	const [isButtonDisabled, setIsButtonDisabled] = useState(false);
	const history = useHistory();

	const handleSubmit = async (event) => {
		event.preventDefault();
		setIsButtonDisabled(true);
		const data = new FormData(event.currentTarget);

		setApiFirstNameError("");
		setApiLastNameError("");
		setApiUniEmailError("");
		setApiPasswordError("");
		setPasswordConfirmError("");

		if (data.get("password") !== data.get("confirmPassword")) {
			setPasswordConfirmError("Passwords do not match!");
			setIsButtonDisabled(false);
			return;
		}

		const response = await fetch(`${process.env.REACT_APP_URL}/signup`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({
				firstName: data.get("firstName"),
				lastName: data.get("lastName"),
				uniEmail: data.get("email"),
				password: data.get("password"),
			}),
		});

		const json = await response.json();

		Object.values(json["errors"]).forEach((err) => {
			const field = err["field"];
			const message = err["message"];

			if (field === "firstName") {
				setApiFirstNameError(message);
			}
			if (field === "lastName") {
				setApiLastNameError(message);
			}
			if (field === "uniEmail") {
				setApiUniEmailError(message);
			}
			if (field === "password") {
				setApiPasswordError(message);
			}
		});

		if (response.status !== 201) {
			setIsButtonDisabled(false);
			return;
		}

		history.push("/login");
	};

	return (
		<Container component="main" maxWidth="xs">
			<Alert severity="info" sx={{ marginTop: 3 }}>
				<AlertTitle>Use a valid university email!</AlertTitle>
				You will be sent an email with a link to verify after signing up
				<strong> ...Remember to check your spam as well!</strong>
			</Alert>
			<Box
				sx={{
					marginTop: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<Avatar alt="Pacto Icon" src={Icon} />
				<Typography component="h1" variant="h5" sx={{ fontWeight: "bold" }}>
					Join Pacto!
				</Typography>
				<Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6}>
							<TextField
								name="firstName"
								required
								fullWidth
								label="First Name"
								error={apiFirstNameError.length !== 0}
								helperText={apiFirstNameError}
								autoFocus
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<TextField
								required
								fullWidth
								label="Last Name"
								name="lastName"
								error={apiLastNameError.length !== 0}
								helperText={apiLastNameError}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								required
								fullWidth
								label="University Email Address"
								name="email"
								error={apiUniEmailError.length !== 0}
								autoComplete="email"
								helperText={apiUniEmailError}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								required
								fullWidth
								name="password"
								label="Password"
								type="password"
								data-testid="initial-password-input"
								error={apiPasswordError.length !== 0}
								helperText={apiPasswordError}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								required
								fullWidth
								name="confirmPassword"
								label="Confirm Password"
								type="password"
								error={passwordConfirmError.length !== 0}
								helperText={passwordConfirmError}
								data-testid="confirm-password-input"
							/>
						</Grid>
					</Grid>
					<Button
						type="submit"
						fullWidth
						disabled={isButtonDisabled}
						variant="contained"
						sx={{ mt: 3, mb: 2 }}
					>
						Sign Up
					</Button>
					<Grid container justifyContent="flex-start">
						<Grid item>
							<Link to="/login" variant="body2">
								Already have an account? Sign in
							</Link>
						</Grid>
					</Grid>
				</Box>
			</Box>
		</Container>
	);
}
