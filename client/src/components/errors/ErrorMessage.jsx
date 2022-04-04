/**
 * An abstraction to create snackbar errors on any page
 */

import React from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

/**
 * An abstraction to create error snackbars
 * @param {boolean} isOpen A boolean state signifying whether if snackbar is open
 * @param {function} setIsOpen A function to set the boolean state
 * @param {string} message The message which shows in the snackbar
 */
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
