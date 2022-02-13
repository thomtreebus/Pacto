import { Card, CardContent, IconButton } from "@mui/material";
import { useState } from "react";
import { Grid, Typography } from "@mui/material";

import ThumbUpRoundedIcon from "@mui/icons-material/ThumbUpRounded";
import ThumbDownRoundedIcon from "@mui/icons-material/ThumbDownRounded";

export default function TextPostCard({ post }) {
  const [thumbUp, setThumbUp] = useState(upvoted);
  const [thumbDown, setThumbDown] = useState(downvoted);
  const [likes, setLikes] = useState(numberOfLikes);

  const handleLikeEvent = (event) => {
    // Dispatch message to server about like event
    // 0 => Post was liked. May have previously been disliked.
    // 1 => Post was unliked.
    // 2 => Post was disliked. May have previously been liked.
    // 3 => Post was undisliked.
  }

  return (
    <Card sx={{ width: "100%" }}>
      <CardContent>
        <Grid container direction="row">
          <Grid container item direction="column" sm={2} lg={1} sx={{ alignSelf: "baseline", alignItems: "center" }}>
            <Grid item>
              <IconButton sx={{ paddingRight: 0, paddingLeft: 0, paddingTop: 0 ,paddingBottom: 0 }} onClick={() => {
                if (!thumbUp) {
                  setLikes(numberOfLikes + 1)
                  setThumbDown(false);
                  handleLikeEvent(0)
                } else {
                  setLikes(likes - 1)
                  handleLikeEvent(1)
                }
                setThumbUp(!thumbUp);
              }}>
                <ThumbUpRoundedIcon color={thumbUp ? "primary" : "inherit"}/>
              </IconButton>
            </Grid>

            <Grid item paddingLeft={1}>
              <Typography>
                {post.likes}
              </Typography>
            </Grid>

            <Grid item>
              <IconButton sx={{ paddingRight: 0, paddingLeft: 0, paddingTop: 0 ,paddingBottom: 0 }} onClick={() => {
                if (!thumbDown) {
                  setLikes(numberOfLikes - 1)
                  handleLikeEvent(2)
                  setThumbUp(false);
                } else {
                  setLikes(likes + 1)
                  handleLikeEvent(3)
                }
                setThumbDown(!thumbDown);
              }}>
                <ThumbDownRoundedIcon color={thumbDown ? "secondary" : "inherit"}/>
              </IconButton>
            </Grid>
          </Grid>

          <Grid container item direction="column" sm={10} lg={11} sx={{ cursor: "pointer" }}>
            <Grid item>
              <Typography variant="subtitle1">
                Posted by {post.author} on {post.date}
              </Typography>
            </Grid>
            <Grid item zeroMinWidth>
              <Typography variant="h5">
                {post.title}
              </Typography>
            </Grid>
            <Grid item sx={{ float: "down" }}>
              <Typography variant="subtitle2">
                {post.numberOfComments} {post.numberOfComments === 1 ? "Comment" : "Comments"}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}