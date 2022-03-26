import React, { useState } from "react";
import { Card, Typography } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Icon from "../assets/pacto-logo.ico";
import { useHistory } from "react-router-dom";
import MenuItem from "@mui/material/MenuItem";
import { useAuth } from "../providers/AuthProvider";

export default function CreatePactPage() {
	const [category, setCategory] = useState("");
	const [isButtonDisabled, setIsButtonDisabled] = useState(false);
	const history = useHistory();

	const [apiPactNameError, setApiPactNameError] = useState("");
	const [apiPactCategoryError, setApiPactCategoryError] = useState("");
	const [apiPactDescriptionError, setApiPactDescriptionError] = useState("");

	const { silentUserRefresh } = useAuth();

	const handleCategoryChange = (event) => {
		setCategory(event.target.value);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		setIsButtonDisabled(true);

		setApiPactNameError("");
		setApiPactCategoryError("");
		setApiPactDescriptionError("");

		const response = await fetch(`${process.env.REACT_APP_URL}/pact`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({
				name: data.get("pact-name"),
				category: data.get("category-select"),
				description: data.get("description"),
			}),
		});

		const json = await response.json();

		Object.values(json["errors"]).forEach((err) => {
			const field = err["field"];
			const message = err["message"];

			switch (field) {
				case "name":
					setApiPactNameError(message);
					break;
				case "category":
					setApiPactCategoryError(message);
					break;
				case "description":
					setApiPactDescriptionError(message);
					break;
				// no default
			}
			setIsButtonDisabled(false);
		});

		if (response.status !== 201) {
			return;
		}

		silentUserRefresh();

		history.push(`/pact/${json.message._id}`);
	};

	return (
		<>
			<Card
				sx={{
					padding: "30px",
					margin: "auto",
				}}
			>
				<Grid
					container
					direction="row"
					justifyContent="center"
					alignItems="center"
				>
					<Grid
						container
						item
						xs={12}
						justifyContent="center"
						alignItems="center"
					>
						<Avatar alt="Pacto Icon" src={Icon} />
					</Grid>
					<Grid
						container
						item
						xs={12}
						justifyContent="center"
						alignItems="center"
					>
						<Typography component="h1" variant="h5" sx={{ fontWeight: "bold" }}>
							Create Pact
						</Typography>
					</Grid>
				</Grid>

				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						paddingBottom: "10px",
					}}
					lg={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						paddingInline: "50px",
					}}
				>
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
							label="Pact Name"
							data-testid="pact-name"
							name="pact-name"
							error={apiPactNameError.length !== 0}
							helperText={apiPactNameError}
							autoFocus
						/>
						<TextField
							data-testid="category-select"
							alignitems="center"
							margin="normal"
							required
							fullWidth
							id="category-select"
							name="category-select"
							select
							value={category}
							onChange={handleCategoryChange}
							label="Category"
							error={apiPactCategoryError.length !== 0}
							helperText={apiPactCategoryError}
						>
							<MenuItem value={"society"} data-testid="subject-item">
								Society
							</MenuItem>
							<MenuItem value={"course"} data-testid="module-item">
								Course
							</MenuItem>
							<MenuItem value={"module"} data-testid="society-item">
								Module
							</MenuItem>
							<MenuItem value={"other"} data-testid="other-item">
								Other
							</MenuItem>
						</TextField>
						<TextField
							name="description"
							margin="normal"
							data-testid="pact-description"
							id="description"
							label="Description"
							required
							fullWidth
							multiline
							rows={4}
							error={apiPactDescriptionError.length !== 0}
							helperText={apiPactDescriptionError}
						/>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							disabled={isButtonDisabled}
							sx={{ mt: 3, mb: 2 }}
						>
							Create Pact
						</Button>
					</Box>
				</Box>
			</Card>
		</>
	);
}
