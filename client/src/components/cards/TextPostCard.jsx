import { Typography } from "@mui/material";

export default function TextPostCard({ post }) {
  return (
    <Typography variant="body1">
      {post.text}
    </Typography>
  )
}
