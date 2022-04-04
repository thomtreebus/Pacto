import { useParams } from "react-router-dom";
import Button from "@mui/material/Button";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Card } from "@mui/material";
import ErrorMessage from "../../components/errors/ErrorMessage";
import PactoIcon from "../../assets/pacto-logo.png";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";

/**
 * This is the page used to verify the email codes.
 * @returns {JSX.Element}
 */
export default function Verify() {
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState(null);
	const [buttonIsDisabled, setButtonIsDisabled] = useState(false);
	const { id } = useParams();
	const history = useHistory();

	/**
	 * This function is called when verify prompt is clicked.
	 */
	const handleClick = async () => {
		setButtonIsDisabled(true);
		const response = await fetch(
			`${process.env.REACT_APP_URL}/verify?code=${id}`,
			{
				method: "GET",
			}
		);

		if (response.ok) {
			history.push("/login");
		} else {
			setSnackbarMessage("Unable to verify the account!");
			setSnackbarOpen(true);
			setButtonIsDisabled(false);
		}
	};

	return (
		<>
			<ErrorMessage
				isOpen={snackbarOpen}
				setIsOpen={setSnackbarOpen}
				message={snackbarMessage}
			/>
			<div className="content">
				<div
					style={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
					}}
				>
					<Card
						sx={{
							padding: "2rem 2rem",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: "2rem",
						}}
					>
						<Box
							sx={{
								padding: "2rem 5rem",
								display: "flex",
								alignItems: "center",
								gap: "1rem",
							}}
						>
							<Avatar src={PactoIcon} alt="Pacto Icon" />
							<Typography
								variant="h5"
								sx={{ color: "rgb(25,118,210)", fontWeight: "bold" }}
							>
								Pacto
							</Typography>
						</Box>
						<Button
							className="signin-link"
							onClick={handleClick}
							disabled={buttonIsDisabled}
							label="Verify Account"
							variant="contained"
							sx={{
								color: "white",
								borderRadius: "15px",
								backgroundColor: "rgb(25,118,210)",
								fontWeight: "bold",
								border: "3px solid",
								transition: "all 200ms ease-in 0s",
								"&:hover": {
									backgroundColor: "white",
									color: "rgb(25,118,210)",
									border: "3px solid",
									borderColor: "rgb(25,118,210)",
									transform: "scale(1.05)",
								},
							}}
						>
							Verify your email
						</Button>
					</Card>
				</div>
			</div>
		</>
	);
}
