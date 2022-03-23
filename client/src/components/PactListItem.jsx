import React, { useState } from "react";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Modal, Box, Typography } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import { useHistory } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { Button, Divider, Alert } from "@mui/material";

export default function PactListItem({ pact }) {
	const { user, setUser } = useAuth();
	const history = useHistory();
	const [showJoinConfirmation, setShowJoinConfirmation] = useState(false);
	const [isJoinButtonDisabled, setIsJoinButtonDisabled] = useState(false);
	const [errorMessage, setErrorMessage] = useState(null);

	const handleClose = () => {
		setShowJoinConfirmation(false);
	};

	function handleClick() {
		if (pact.members.includes(user._id)) {
			history.replace(`/pact/${pact._id}`);
		} else {
			setShowJoinConfirmation(true);
		}
	}

	async function handleJoinButtonClick() {
		setIsJoinButtonDisabled(true);

		const response = await fetch(
			`${process.env.REACT_APP_URL}/pact/${pact._id}/join`,
			{
				method: "POST",
				credentials: "include",
			}
		);

		const json = await response.json();

		if (json.errors.length) {
			setErrorMessage(json.errors[0].message);
			setIsJoinButtonDisabled(false);
			return;
		}

		let newUser = Object.assign({}, user);
		newUser.pacts.push(pact._id);
		setUser(newUser);
		history.push(`/pact/${pact._id}`);
	}

	return (
		<>
			<ListItem
				onClick={handleClick}
				sx={{ cursor: "pointer" }}
				data-testid="item"
			>
				<ListItemIcon>
					<Avatar src={pact.image} data-testid="avatar" />
				</ListItemIcon>
				<ListItemText primary={pact.name} />
			</ListItem>

			{pact.members.includes(user._id) || (
				<Modal open={showJoinConfirmation} onClose={handleClose}>
					<Box
						sx={{
							position: "absolute",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
							bgcolor: "background.paper",
							boxShadow: 24,
							pt: 2,
							px: 4,
							pb: 3,
							width: 400,
						}}
					>
						{errorMessage && <Alert severity="error">{errorMessage}</Alert>}

						<Typography id="parent-modal-description" variant="h6">
							Do you want to join '{pact.name}'
						</Typography>

						<Divider sx={{ marginBlock: "5px" }} />
						<Button
							onClick={handleJoinButtonClick}
							disabled={isJoinButtonDisabled}
						>
							Join
						</Button>
						<Button color="secondary" onClick={handleClose}>
							Close
						</Button>
					</Box>
				</Modal>
			)}
		</>
	);
}
