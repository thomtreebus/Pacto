import { Card, CardContent, IconButton } from "@mui/material";
import { useState } from "react";
import { Grid, Typography } from "@mui/material";

import ThumbUpRoundedIcon from "@mui/icons-material/ThumbUpRounded";
import ThumbDownRoundedIcon from "@mui/icons-material/ThumbDownRounded";

export default function PostCard({ author, title, numberOfLikes, upvoted, downvoted, numberOfComments, date }) {
  author = "Krishi Wali"
  date = "08/02/2022"
  numberOfLikes = 5;
  title = "Lorem ipsum dolor inventore ad! Porro soluta eum amet officia molestias esse!"
  numberOfComments = 100;
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
      <Card>
        <CardContent>
          <Grid container direction="row">
            <Grid container item direction="column" width={50}>
              <Grid item>
                <IconButton onClick={() => {
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

              <Grid item paddingLeft={2}>
                <Typography>
                  {likes}
                </Typography>
              </Grid>

              <Grid item>
                <IconButton onClick={() => {
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

            <Grid container item direction="column" xs={10} sx={{ cursor: "pointer" }}>
              <Grid item>
                <Typography variant="subtitle1">
                  Posted by {author} on {date}
                </Typography>
              </Grid>
              <Grid item zeroMinWidth>
                <Typography variant="h5">
                  {title}
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="subtitle2">
                  {numberOfComments} {numberOfComments === 1 ? "Comment" : "Comments"}
                </Typography>
              </Grid>
            </Grid>

          </Grid>
        </CardContent>
      </Card>
  )
}
