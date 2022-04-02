import { Box } from "@mui/material"

/**
 * The card used to display images
 * @param {Object} post The post being displayed
 */
export default function ImagePostCard({ post }) {
  return (
    <Box textAlign="center">
      <img src={post.image} alt="" style={{ maxWidth: "100%", maxHeight: "600px"}}/>
    </Box>
  )
}