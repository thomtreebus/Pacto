import { Box, Card, CardContent, IconButton } from "@mui/material";
import { useState } from "react";
import { Typography } from "@mui/material";

import ThumbUpRoundedIcon from "@mui/icons-material/ThumbUpRounded";
import ThumbDownRoundedIcon from "@mui/icons-material/ThumbDownRounded";

export default function TextPostCard({ post }) {
  const [thumbUp, setThumbUp] = useState(post.upvoted);
  const [thumbDown, setThumbDown] = useState(post.downvoted);
  const [likes, setLikes] = useState(post.votes);

  const handleLikeEvent = (event) => {
    // Dispatch message to server about like event
    // 0 => Post was unliked.
    // 1 => Post was liked and undisliked.
    // 2 => Post was liked.
    // 3 => Post was undisliked.
    // 4 => Post was disliked and unliked.
    // 5 => Post was disliked.
  }

  return (
    <Card sx={{ width: "100%" }}>
      <CardContent>
        <Box sx={{ overflow: "hidden" }}>
          <Box sx={{ float: "left", paddingRight: "16px", textAlign: "center" }}>
            <IconButton sx={{ paddingRight: 0, paddingLeft: 0, paddingTop: 0 ,paddingBottom: 0 }} onClick={() => {
              if (thumbUp) {
                setLikes(likes - 1);
                handleLikeEvent(0);
              } else if (thumbDown) {
                setLikes(likes + 2);
                setThumbDown(false);
                handleLikeEvent(1);
              } else {
                setLikes(likes + 1)
                handleLikeEvent(2);
              }
              setThumbUp(!thumbUp);
            }}>
              <ThumbUpRoundedIcon color={thumbUp ? "primary" : "inherit"}/>
            </IconButton>

            <Typography>
              {likes}
            </Typography>

            <IconButton sx={{ paddingRight: 0, paddingLeft: 0, paddingTop: 0 ,paddingBottom: 0 }} onClick={() => {
              if (thumbDown) {
                setLikes(likes + 1);
                handleLikeEvent(3);
              } else if (thumbUp) {
                setLikes(likes - 2);
                setThumbUp(false);
                handleLikeEvent(4);
              } else {
                setLikes(likes - 1)
                handleLikeEvent(5);
              }
              setThumbDown(!thumbDown);
            }}>
              <ThumbDownRoundedIcon color={thumbDown ? "secondary" : "inherit"}/>
            </IconButton>
          </Box>

          <Box sx={{ overflow: "hidden" }}>
            <Typography variant="caption">
              Posted by {post.author.firstName + " " + post.author.lastName} on {post.date}
            </Typography>

            <Typography variant="h6">
              {post.title}
            </Typography>

            <Typography variant="body1">
              {post.text}
            </Typography>

            <Typography variant="subtitle2">
              {post.comments.length} {post.comments.length === 1 ? "Comment" : "Comments"}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}