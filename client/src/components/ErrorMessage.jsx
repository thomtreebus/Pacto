import React from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

function ErrorMessage({ isOpen, setIsOpen, message }) {
	const handleClose = () => {
		setIsOpen(false);
	};

	return (
		<Snackbar
			anchorOrigin={{ vertical: "top", horizontal: "center" }}
			open={isOpen}
			autoHideDuration={6000}
			onClose={handleClose}
			data-testid="snackbar"
		>
			<Alert severity="error" onClose={handleClose}>
				{message}
			</Alert>
		</Snackbar>
	);
}

export default ErrorMessage;
