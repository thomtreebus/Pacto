import * as React from "react";
import { Card, Typography } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Icon from "../assets/pacto-logo.ico";
import { useHistory } from "react-router-dom";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

export default function EditPact() {
	const [isButtonDisabled, setIsButtonDisabled] = React.useState(false);
	const { pactId } = useParams();
	const history = useHistory();
	const defaultData = {
		name: "",
		category: "",
		description: ""
	};

    const [name, setName] = useState(defaultData.name)
    const [category, setCategory] = useState(defaultData.category)
    const [description, setDescription] = useState(defaultData.description)

		const [apiPactNameError, setApiPactNameError] = React.useState('');
		const [apiPactCategoryError, setApiPactCategoryError] = React.useState('');
		const [apiPactDescriptionError, setApiPactDescriptionError] = React.useState('');


	useEffect(() => {
		fetch(`${process.env.REACT_APP_URL}/pact/${pactId}`, {
		  method: "GET",
		  credentials: "include"
		}).then((res) => {
		  if (!res.ok) {
			throw Error("Could not fetch pacts");
		  }
		  return res.json();
		}).then((resData) => {
			const data = resData.message;
			setName(data.name);
			setCategory(data.category);
			setDescription(data.description);
		}).catch((err) => {
		  console.log(err);
		})
	  }, [pactId])

  
	const handleSubmit = async (event) => {
		event.preventDefault();
		setIsButtonDisabled(true);

		setApiPactNameError('');
		setApiPactCategoryError('');
		setApiPactDescriptionError('');
		console.log("submited")

		const response = await fetch(`${process.env.REACT_APP_URL}/pact/${pactId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({
				"name": name,
				"category": category,
				"description": description,
			}),
		});

		const json = await response.json();
		console.log(json);

		Object.values(json['errors']).forEach(err => {
			const field = err["field"];
			const message = err["message"];

			if (field === "name"){
				setApiPactNameError(message);
			}
			if(field === "category"){
				setApiPactCategoryError(message);
			}
			if (field === "description"){
				setApiPactDescriptionError(message);
			}

			setIsButtonDisabled(false);
		});

		if (response.status !== 201) {
			return;
		}

        if (response.status === 500) {
            console.log(json)
            return history.push(`/editPact/${json.message._id}`);
        }
	};

	return (
		<>
			<Card
			sx={{
				padding: "40px",
				margin: "auto",
			}}
			>
				<Box
					sx={{
						// height: "calc(100vh - 68.5px)",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						// backgroundColor: "white",
						paddingInline: "200px",
						// paddingBlock: "10px",
						// marginTop: "68.5px" 
					}}
				>
					<Avatar alt="Pacto Icon" src={Icon} />

					<Typography component="h1" variant="h5" sx={{ fontWeight: "bold" }}>
						Edit Pact
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
							label="Pact Name"
							id="name"
							name="name"
							error={apiPactNameError.length !== 0}
							helperText={apiPactNameError}
							autoFocus
							value = {name}
							defaultValue = {name}
							onChange = {(e) => {
									setName(e.target.value)
							}}
						/>

					<TextField
						data-testid='category-select'
						alignitems='center'
						margin="normal"
						required
						fullWidth
						id="category"
						name="category"
						label="Category"
						error={apiPactCategoryError.length !== 0}
						helperText={apiPactCategoryError}
						value = {category}
						defaultValue = {category}
						onChange = {(e) => {
								setCategory(e.target.value)
						}}
					>
					</TextField>

					<TextField
						name="description"
						margin="normal"
						id="description"
						label="Description"
						required
						fullWidth
						multiline
						rows={4}
						error={apiPactDescriptionError.length !== 0}
						helperText={apiPactDescriptionError}
						value = {description}
						onChange = {(e) => {
								setDescription(e.target.value)
						}}
					/>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							disabled={isButtonDisabled}
							sx={{ mt: 3, mb: 2 }}
						>
							Edit Pact
						</Button>
					</Box>
				</Box>
			</Card>
		</>
	);
}