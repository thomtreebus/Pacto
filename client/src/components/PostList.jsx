import { Grid, List, ListItem } from "@mui/material"
import PostCard from "./PostCard"

export default function PostList({ posts }) {
  return (
    <List>
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
