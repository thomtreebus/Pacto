import {Box} from "@mui/system";
import {Typography} from "@mui/material";
import React from "react";

/**
 * Customised TabPanel Solution over MUI's TabPanel.
 * Altered code sourced from https://mui.com/components/tabs
 * @param props The items you want inside a TabPanel.
 * @returns {JSX.Element} A customised
 */
export function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component={'div'}>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

/**
 * Helper function to add an id identifier attribute and track selection.
 * Altered code sourced from https://mui.com/components/tabs
 * @param index Index of the tab
 */
export function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}