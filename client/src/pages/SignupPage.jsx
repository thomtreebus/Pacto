import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Link } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Icon from '../assets/pacto-logo.ico';

export default function SignupPage() {

	const [passwordError, setPasswordError] = React.useState('');

	const handleSubmit = async (event) => {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		
		setPasswordError('')

		if (data.get("password") != data.get("confirmPassword")){
			setPasswordError("Passwords do not match!")
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
				lastName: data.get("lastname"),
				uniEmail: data.get("email"),
				password: data.get("password"),
			}),
		});

		const json = await response.json();
		console.log(1, json);
		

		if (response.status !== 200) {
			return;
		}

		// setIsAuthenticated(true);		
	};

	return (
		<Container component="main" maxWidth="xs">
			<Box
				sx={{
					marginTop: 8,
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
								autoFocus
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<TextField required fullWidth label="Last Name" name="lastName" />
						</Grid>
						<Grid item xs={12}>
							<TextField
								required
								fullWidth
								label="University Email Address"
								name="email"
								autoComplete="email"
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
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								required
								fullWidth
								name="confirmPassword"
								label="Confirm Password"
								type="password"
								error={passwordError.length != 0}
								helperText={passwordError}
								data-testid="confirm-password-input"
							/>
						</Grid>
					</Grid>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						sx={{ mt: 3, mb: 2 }}
					>
						Sign Up
					</Button>
					<Grid container justifyContent="flex-end">
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
