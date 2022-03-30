import * as React from "react";
import { Box, TextField, Grid } from "@mui/material";
import { useState } from "react";
import { IconButton } from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";

// Allows the user to add a comment to some post.
export default function CommentBox({
	post,
	successHandler = () => {},
	repliedToComment = null,
}) {
	const [apiTextError, setApiTextError] = useState("");
	const [isButtonDisabled, setIsButtonDisabled] = React.useState(false);

	const sendComment = async (url, data) => {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({
				text: data.get("text"),
			}),
		});

		return response;
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setIsButtonDisabled(true);
		const data = new FormData(event.currentTarget);

		setApiTextError("");

		let url = `${process.env.REACT_APP_URL}/pact/${post.pact._id}/post/${post._id}/comment`;
		if (repliedToComment) {
			url = url + `/${repliedToComment._id}/reply`;
		}

		// Extract the data we want from the response
		const response = await sendComment(url, data);
		const json = await response.json();

		// Handle errors
		Object.values(json["errors"]).forEach((err) => {
			const field = err["field"];
			const message = err["message"];

			if (field === "text") {
				setApiTextError(message);
			}
		});

		setIsButtonDisabled(false);
		if (response.ok) {
			successHandler(json["message"]);
		}
	};

	return (
		<Box
			component="form"
			noValidate
			onSubmit={handleSubmit}
			sx={{ mt: 2, display: "flex", width: "100%" }}
			justifyContent="center"
			data-testid="comment-reply-box"
		>
			<Grid item sx={{ maxWidth: "60rem", flex: "1" }}>
				<TextField
					data-testid="text-entry-field"
					name="text"
					required
					fullWidth
					label="Comment"
					error={apiTextError.length !== 0}
					helperText={apiTextError}
					autoFocus
					variant="outlined"
					InputProps={{
						endAdornment: (
							<IconButton
								sx={{ p: "10px" }}
								disabled={isButtonDisabled}
								color="primary"
								data-testid="submit-button"
								type="submit"
							>
								<ReplyIcon />
							</IconButton>
						),
					}}
				/>
			</Grid>
		</Box>
	);
}
