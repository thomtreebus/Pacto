import { List, ListItem } from "@mui/material"
import PostCard from "./PostCard"

export default function PostList({ posts }) {
  return (
    <List sx={{ width: "85%" }}>
      {
        posts.map((post, index) => (
          <ListItem key={index}>
            <PostCard post={post}/>
          </ListItem>
        ))
      }
    </List>
  )
}
