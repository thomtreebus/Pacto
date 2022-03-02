import { Box } from "@mui/material"

export default function ImagePostCard({ post }) {
  return (
    <Box textAlign="center">
      <img src={post.image} style={{ "max-width": "100%"}}/>
    </Box>
  )
}