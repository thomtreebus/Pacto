import { useParams } from "react-router-dom";
import Button from "@mui/material/Button";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Container from "@mui/material/Container";
import { Box } from "@mui/system";
import ErrorMessage from "../components/ErrorMessage";

/**
 * This is the page used to verify the email codes.
 * @returns {JSX.Element}
 */
export default function Verify() {
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState(null);
	const [buttonIsDiabled, setButtonIsDisabled] = useState(false);
	const { id } = useParams();
	const history = useHistory();

	/**
	 * This function is called when the
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
			<div className="content" />
			<div className="container">
				<Button
          onClick={handleClick}
          disabled={buttonIsDiabled}
					label="Verify Account"
					sx={{
						float: "right",
						margin: "auto",
						color: "white",
						height: "45px",
						borderRadius: "15px",
						backgroundColor: "rgb(25,118,210)",
						fontWeight: "bold",
						border: "3px solid",
						"&:hover": {
							backgroundColor: "white",
							color: "rgb(25,118,210)",
							border: "3px solid",
							borderColor: "white",
						},
					}}
					variant="contained"
				>
					Verify and Login
				</Button>
			</div>
		</>
	);
}
