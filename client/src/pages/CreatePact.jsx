import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Icon from "../assets/pacto-logo.ico";
import Typography from "@mui/material/Typography";
import { useHistory } from "react-router-dom";
import MenuItem from '@mui/material/MenuItem';

export default function LoginPage() {
  const [category, setCategory] = React.useState('');
	const [isButtonDisabled, setIsButtonDisabled] = React.useState(false);
	const history = useHistory();

	const [apiPactNameError, setApiPactNameError] = React.useState('');
	const [apiPactCategoryError, setApiPactCategoryError] = React.useState('');
	const [apiPactDescriptionError, setApiPactDescriptionError] = React.useState('');



  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };
  
	const handleSubmit = async (event) => {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		setIsButtonDisabled(true);

		setApiPactNameError('');
		setApiPactCategoryError('');
		setApiPactDescriptionError('');

		const response = await fetch(`${process.env.REACT_APP_URL}/pact`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({
				name: data.get("pact-name"),
				category: data.get("category-select"),
				description: data.get("description")
			}),
		});

		console.log(response);
		const json = await response.json();
		
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
			setIsButtonDisabled(true)
			console.log(json);
			return;
		}

		history.push(`/pact/${json.message._id}`);
		console.log(json)
		
	};

	return (
		<>
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
              backgroundColor: "white",
              paddingInline: "200px",
              paddingBlock: "10px",
              marginBlock: "auto" 
						}}
					>
						<Avatar alt="Pacto Icon" src={Icon} />

						<Typography component="h1" variant="h5" sx={{ fontWeight: "bold" }}>
							Create Pact
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
								name="pact-name"
								error={apiPactNameError.length !== 0}
                helperText={apiPactNameError}
								autoFocus
							/>

            <TextField
							data-testid='category-select'
              alignitems='center'
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
              fullWidth
              label="Upload Image"
              variant="contained"
              component="span"
              sx={{
                marginTop: 1
              }}
              >
              Upload Image
            </Button>
            
							
							<Button
								type="submit"
								fullWidth
								variant="contained"
								disabled={isButtonDisabled}
								sx={{ mt: 3, mb: 2 }}
							>
								Create Pact
							</Button>
							<Grid container>
							</Grid>
						</Box>
					</Box>
          <Grid container component="main" sx={{ height: "100%" }}>
				</Grid>
		</>
	);
}
