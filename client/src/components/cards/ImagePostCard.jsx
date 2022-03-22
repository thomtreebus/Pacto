import { Box } from "@mui/material"

export default function ImagePostCard({ post }) {
  return (
    <Box textAlign="center">
      <img src={post.image} alt="" style={{ maxWidth: "100%", maxHeight: "600px"}}/>
    </Box>
  )
}