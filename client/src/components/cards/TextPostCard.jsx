import { Box } from "@mui/material"
import CollapsingText from "../CollapsingText"

export default function TextPostCard({ post }) {
  return (
  <Box sx={{ width: "100%", flex: 1, flexWrap: 'wrap', wordBreak: "break-word" }}>
    <CollapsingText 
    text={
      post.text
    }
    />
    </Box>
  )
}