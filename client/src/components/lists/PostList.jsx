import { Card, Grid, IconButton, InputBase, List, ListItem } from "@mui/material"
import PostCard from "../cards/PostCard"
/**
 * A component to render a list of posts
 */

import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { Typography } from "@mui/material";
import { useEffect } from "react";

/**
 * List of posts to display
 * @param {Array} posts Array of posts
 */
export default function PostList({ posts, searchable=true, showPact=false }) {
  const [orderablePosts, setPosts] = useState(posts);
	const [search, setSearch] = useState("");

  useEffect(() => {
    setPosts(
      posts.filter(
        (post) => post.title.toLowerCase().includes(search)
      ).sort((a, b) => {
        if (a.createdAt > b.createdAt) return -1;
        else if (a.createdAt < b.createdAt) return 1;
        else return 0;
      })
    );
	}, [search, posts]);

  return (
    <Grid container sx={{ paddingTop: "8px" }}>
      <Grid container sx={{ paddingLeft: "16px", paddingRight: "16px" }}>
        { searchable && (
          <Grid item sx={{ minWidth: "100%" }}>
            <Card
              data-testid="search-box"
              sx={{
                p: "2px 4px",
                marginBlock: "10px",
                display: "flex",
                alignItems: "center",
                width: "100%",
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Search Posts"
                value={search}
                onChange={(e) => setSearch(e.target.value.toLowerCase())}
              />
              <IconButton
                sx={{ p: "10px" }}
                disabled={!search}
                color="primary"
                onClick={() => setSearch("")}
                data-testid="search-button"
              >
                {search ? (
                  <CloseIcon data-testid="clear-icon" />
                ) : (
                  <SearchIcon data-testid="search-icon" />
                )}
              </IconButton>
            </Card>
          </Grid>
        )}
      </Grid>
      <Grid item width="100%">

        {!orderablePosts.length ?
          (
            <Typography variant="subtitle1" sx={{ textAlign: "center" }}>
              There are no posts available
            </Typography>
          )
        :
         (
          <List>
          {
            orderablePosts.map((post) => (
              <ListItem key={post._id}>
                <PostCard post={post} showPact={showPact}/>
              </ListItem>
            ))
          }
          </List>
         )
        }
      </Grid>
    </Grid>
  )
}
