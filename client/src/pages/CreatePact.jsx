import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Icon from "../assets/pacto-logo.ico";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import MenuItem from '@mui/material/MenuItem';

export default function LoginPage() {
  const [category, setCategory] = React.useState('Subjects')
	const [snackbarOpen, setSnackbarOpen] = React.useState(false);
	const [snackbarMessage, setSnackbarMessage] = React.useState(null);
	const [isButtonDisabled, setIsButtonDisabled] = React.useState(false);

	const handleClose = () => {
		setSnackbarOpen(false);
	};

  const handleCategoryChange = (event) => {
    setCategory(event.target.value)
  };

  
	const handleSubmit = async (event) => {
		event.preventDefault();
		setIsButtonDisabled(true);
		const data = new FormData(event.currentTarget);
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
                helperText="What is the name of your Pact?"
								autoFocus
							/>

            <TextField
							data-testid='category-select'
              alignItems='center'
              margin="normal"
              required
							fullWidth
              id="outlined-select-currency"
              select
              value={category}
              onChange={handleCategoryChange}
              label="Select"
              helperText="What type of Pact is this?"
            >
              <MenuItem value="Subject" data-testid="subject-item">
                Subject
              </MenuItem>
              <MenuItem value="Module" data-testid="module-item">
                Module
              </MenuItem>
              <MenuItem value="Society" data-testid="society-item">
                Society
              </MenuItem>
              <MenuItem value="Other" data-testid="other-item">
                Other
              </MenuItem>
            </TextField>

            <TextField
              margin="normal"
              id="outlined-multiline-static"
              label="Description"
              required
              fullWidth
              multiline
              rows={4}
              helperText="What is your pact about?"
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
							<Grid container>
							</Grid>
						</Box>
					</Box>
          <Grid container component="main" sx={{ height: "100%" }}>
				</Grid>
			<Snackbar
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
				open={snackbarOpen}
				autoHideDuration={6000}
				onClose={handleClose}
				data-testid="snackbar"
			>
				<Alert severity="error" onClose={handleClose}>
					{snackbarMessage}
				</Alert>
			</Snackbar>
		</>
	);
}
