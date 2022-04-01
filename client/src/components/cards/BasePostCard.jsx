import { Box, Card, CardContent } from "@mui/material";
import { Typography } from "@mui/material";
import { useHistory } from "react-router-dom";
import CommentIcon from "@mui/icons-material/Comment";
import { relativeTime } from "../../helpers/timeHandler";
import { useAuth } from "../../providers/AuthProvider";
import Voter from "../Voter";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import { useState } from "react";
import ErrorMessage from "../ErrorMessage";

export default function BasePostCard({ children, post, numComments = null, showPact = false }) {
	const { user, silentUserRefresh } = useAuth();
	const commentCount = numComments === null ? post.comments.length : numComments;
	const [isButtonDisabled, setIsButtonDisabled] = useState(false);
	const [isError, setIsError] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const history = useHistory();

	const handleDelete = async () => {
		setIsButtonDisabled(true);

		const response = await fetch(
			`${process.env.REACT_APP_URL}/pact/${post.pact._id}/post/${post._id}`,
			{
				method: "DELETE",
				credentials: "include",
			}
		);

		try {
			if (response.status !== 204) {
				const json = await response.json();
        throw Error(json.errors?.length ? json.errors[0].message : "Server Error");
			}
		} catch (err) {
			setIsError(true);
			setErrorMessage(err.message);
			setIsButtonDisabled(false);
			return;
		}

		await silentUserRefresh();
		history.push(`/pact/${post.pact._id}`);
	};

	const handleLikeEvent = async (eventCode) => {
		const url = (() => {
			switch (eventCode) {
				case 0:
					return `pact/${post.pact._id}/post/upvote/${post._id}`;
				case 1:
					return `pact/${post.pact._id}/post/downvote/${post._id}`;
				// no default
			}
		})();
		fetch(`${process.env.REACT_APP_URL}/${url}`, {
			method: "PUT",
			credentials: "include",
		});
	};

	return (
		<>
			<ErrorMessage
				isOpen={isError}
				setIsOpen={setIsError}
				message={errorMessage}
			/>
			<Card sx={{ width: "100%" }} data-testid="card">
				<CardContent>
					<Box sx={{ overflow: "hidden" }}>
						<Voter
							initThumbUp={post.upvoters.includes(user._id)}
							initThumbDown={post.downvoters.includes(user._id)}
							handleLikeEvent={handleLikeEvent}
							initLikes={post.votes}
						/>
						<Box sx={{ overflow: "hidden" }}>
							<Typography variant="caption" data-testid="author-date-line">
								Posted by{" "}
								<span
									onClick={() => history.push(`/user/${post.author._id}`)}
									className="link"
									data-testid="author"
								>
									{post.author.firstName + " " + post.author.lastName}
								</span>{" "}
								{relativeTime(post.createdAt) + " "}
								{showPact && <span
									onClick={() => history.push(`/pact/${post.pact._id}`)}
									className="link"
									data-testid="pact"
								>
									{`in ${post.pact.name}`}
								</span>}
							</Typography>

							<Typography variant="h6" data-testid="title" className="link" onClick={() => {
									history.push(`/pact/${post.pact._id}/post/${post._id}`);
								}}>
								{post.title}
							</Typography>

							{children}
						</Box>
					</Box>
					<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
					<Box sx={{ display: "flex", marginTop: 1 }}>
						<Typography
							variant="subtitle2"
							className="link"
							data-testid="comments"
							sx={{ textAlign: "left" }}
							onClick={() => {
								history.push(`/pact/${post.pact._id}/post/${post._id}`);
							}}
						>
							<CommentIcon
								sx={{ verticalAlign: "middle", marginRight: "5px" }}
							/>
							{commentCount} {commentCount === 1 ? "Comment" : "Comments"}
						</Typography>
					</Box>
					<Box sx={{ display: "flex" }}>
						{(post.author._id === user._id ||
							post.pact.moderators.includes(user._id)) && (
								<IconButton
									color="error"
									onClick={handleDelete}
									disabled={isButtonDisabled}
									data-testid="delete-button"
								>
									<DeleteIcon fontSize="medium" />
								</IconButton>
						)}
					</Box>
					
					</Box>
				</CardContent>
			</Card>
		</>
	);
}
