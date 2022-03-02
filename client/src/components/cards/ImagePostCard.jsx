import { Box } from "@mui/material"

export default function ImagePostCard({ post }) {
  return (
    <Box textAlign="center">
      <img src={post.image} style={{ maxWidth: "100%", maxHeight: "600px"}}/>
    </Box>
  )
}