import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";
import { Typography, Collapse, Grid, IconButton } from "@mui/material";
import { useState, useRef, useLayoutEffect } from "react";

export default function TextPostCard({ post }) {
  const [collapse, setCollapse] = useState(false);
  const textRef = useRef();
  const [dimensions, setDimensions] = useState({ width:0, height: 0 });

  // Uses some code from https://stackoverflow.com/questions/49058890/how-to-get-a-react-components-size-height-width-before-render

  // Get dimensions of the text content.
  const getTextDimensions = () => {
    if (textRef.current) {
      setDimensions({
        width: textRef.current.offsetWidth,
        height: textRef.current.offsetHeight
      });
    }
  }

  // Get dimensions of text on first render, to determine whether a collapsible component is needed
  useLayoutEffect(() => {
    getTextDimensions();
  }, []);

  // Milliseconds the window size must be constant for before rechecking if collapsing is needed.
  // Otherwise we get significant lag
  const RESET_TIMEOUT = 100;

  let movement_timer = null; // Will eventually be an object when clearInterval is called

  // Get dimensions of text whenever the window is resized
  window.addEventListener('resize', ()=>{
    clearInterval(movement_timer);
    movement_timer = setTimeout(getTextDimensions, RESET_TIMEOUT);
  });


  return (
    dimensions.height > 100 ? <Grid>
      <Collapse in={collapse} collapsedSize="100px">
        <Typography variant="body1" ref={textRef}>
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
    <Typography variant="body1" ref={textRef}>
      {post.text}
    </Typography>
  )
}
