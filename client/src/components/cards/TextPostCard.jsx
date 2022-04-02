/**
 * The card which displays the text component of a post
 */

import { Box } from "@mui/material"
import CollapsingText from "../CollapsingText"

/**
 * The card used to display text posts
 * @param {Object} post The post being displayed
 */
export default function TextPostCard({ post }) {
  return (
    <Box sx={{ width: "100%", flex: 1, flexWrap: 'wrap', wordBreak: "break-word" }}>
      <CollapsingText text={post.text} />
    </Box>
  )
}