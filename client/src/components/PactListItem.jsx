import React, { useState } from "react";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Modal, Box, Typography } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import { useHistory } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { Button, Divider } from "@mui/material";

export default function PactListItem({ pact }) {
	const { user } = useAuth();
	const history = useHistory();
	const [showJoinConfirmation, setShowJoinConfirmation] = useState(false);

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
							width: 400,
							bgcolor: "background.paper",
							boxShadow: 24,
							pt: 2,
							px: 4,
							pb: 3,
							width: 400,
						}}
					>
						<Typography id="parent-modal-description" variant="h6">
							Do you want to join the '{pact.name}' pact
						</Typography>
						<Divider sx={{ marginBlock: "20px" }} />
						<Button onClick={handleClose}>Confirm</Button>
						<Button color="secondary" onClick={handleClose}>
							Close
						</Button>
					</Box>
				</Modal>
			)}
		</>
	);
}
