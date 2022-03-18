import {Card, CardActionArea, CardContent, CardMedia, Typography, Link } from "@mui/material";
import { useEffect, useState } from "react";

export default function LinkPostCard({ post }) {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");

  useEffect(() => {
    fetch(`${process.env.REACT_APP_LINKPREVIEW_URL}/?key=${process.env.REACT_APP_LINKPREVIEW_KEY}&q=${post.link}`, {
      method: "GET",
    }).then((res) => {
      console.log(res);
      if (!res.ok) {
        throw Error("Could not fetch pact");
      }
      return res.json();
    }).then((data) => {
      setImage(data.image);
      setText(data.title);
    }).catch((err) => {
      console.log(err);
    })
  }, [post])

  return (
    <Card sx={{ marginBottom: "5px" }}>
      <Link href={post.link} sx={{ textDecoration: "none", color: "black" }}>
        <CardActionArea>
          {image &&
          <CardMedia
            component="img"
            height="140"
            image={image}
          />}
          {text &&
          <CardContent sx={{ backgroundColor: "gold" }}>
            <Typography>
              {text}
            </Typography>
          </CardContent>
          }
          <CardContent sx={{ padding: "5px", backgroundColor: "gray", color: "white" }}>
            <Typography variant="subtitle" sx={{ overflowWrap: "anywhere" }}>
              {post.link}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Link>
    </Card>
  )
}