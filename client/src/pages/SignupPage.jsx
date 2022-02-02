import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Link, useHistory } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Icon from '../assets/pacto-logo.ico';
import { useAuth } from "../providers/AuthProvider";




export default function SignupPage() {
	
	const [passwordConfirmError, setPasswordConfirmError] = React.useState('');
	const [apiFirstNameError, setApiFirstNameError] = React.useState('');
	const [apiLastNameError, setApiLastNameError] = React.useState('');
	const [apiUniEmailError, setApiUniEmailError] = React.useState('');
	const [apiPasswordError, setApiPasswordError] = React.useState('');
	const history = useHistory();
	const { setIsAuthenticated } = useAuth();


	const handleSubmit = async (event) => {
		event.preventDefault();
		const data = new FormData(event.currentTarget);

		setApiFirstNameError('');
		setApiLastNameError('');
		setApiUniEmailError('');
		setApiPasswordError('');
		setPasswordConfirmError('');

		if (data.get("password") != data.get("confirmPassword")){
			setPasswordConfirmError("Passwords do not match!");
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
		
		Object.values(json['errors']).forEach(err => {
			const field = err["field"];
			const message = err["message"];

			if (field == "firstName"){
				setApiFirstNameError(message)
			}
			if (field == "lastName"){
				setApiLastNameError(message)
			}
			if (field == "uniEmail"){
				setApiUniEmailError(message)
			}
			if (field == "password"){
				setApiPasswordError(message)
			}

		});

		if (response.status !== 200) {
			return;
		}

		
		history.push("/login");
		
	};
	/*

	{
    "firstName": "asd",
    "lastName": "asd",
    "uniEmail": "asdasdsad@kcl.ac.uk",
    "password": "Password123"
}

	*/

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
								error={apiFirstNameError.length != 0}
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
								error={apiLastNameError.length != 0}
								helperText={apiLastNameError}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								required
								fullWidth
								label="University Email Address"
								name="email"
								error={apiUniEmailError.length != 0}
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
								error={apiPasswordError.length != 0}
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
								error={passwordConfirmError.length != 0}
								helperText={passwordConfirmError}
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
