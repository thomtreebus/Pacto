
import * as React from "react";
import { Box, TextField, Button, Grid } from "@mui/material"
import { useState } from "react";

// Allows the user to add a comment to some post.
export default function CommentBox({post, successHandler=()=>{}, repliedToComment=null}){

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
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
		setIsButtonDisabled(true);
    const data = new FormData(event.currentTarget);

    setApiTextError("");

    let url = `${process.env.REACT_APP_URL}/pact/${post.pact._id}/post/${post._id}/comment`;
    if(repliedToComment){
      url = url + `/${repliedToComment._id}/reply`
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

		if (response.status !== 201) { // i.e. an error has occured
			setIsButtonDisabled(false);
			return;
		}

    successHandler(json["message"]);
  }

  return(
    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }} data-testid="comment-reply-box">
      <Grid item xs={12} sm={6}>
        <TextField
          data-testid="text-entry-field"
          name="text"
          required
          fullWidth
          label="Comment"
          error={apiTextError.length !== 0}
          helperText={apiTextError}
          autoFocus
          variant="filled"
        />
      </Grid>

      <Button
        data-testid="submit-button"
        type="submit"
        disabled={isButtonDisabled}
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        Reply
      </Button>
    </Box>
  );
}