import {Card, CardActionArea, CardContent, CardMedia, Typography, Link } from "@mui/material";

export default function LinkPostCard({ post }) {
  return (
    <Card sx={{ marginBottom: "5px" }}>
      <Link href={post.link} sx={{ textDecoration: "none", color: "black" }}>
        <CardActionArea>
          {post.image &&
          <CardMedia
            component="img"
            height="140"
            image={post.image}
          />}
          {post.text &&
          <CardContent sx={{ backgroundColor: "gold" }}>
            <Typography data-testid="text">
              {post.text}
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
