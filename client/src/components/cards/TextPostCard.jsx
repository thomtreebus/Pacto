import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";
import { Typography, Collapse, Grid, IconButton } from "@mui/material";
import { useState } from "react";

export default function TextPostCard({ post }) {
  const [collapse, setCollapse] = useState(false);

  return (
    post.text.length > 200 ? <Grid>
      <Collapse in={collapse} collapsedSize="100px">
        <Typography variant="body1">
          {post.text}
        </Typography>
      </Collapse>
      <Typography onClick={() => {setCollapse(!collapse)}} className="link" variant="subtitle2" color="disabled">
        See more
        <IconButton disableRipple disabledFocusRipple>
          { collapse ? <ArrowDropUp fontSize="medium" /> : <ArrowDropDown fontSize="medium" /> }
        </IconButton>
      </Typography>
    </Grid>
    :
    <Typography variant="body1">
      {post.text}
    </Typography>
  )
}
