
import React from 'react';
import AppBar from "../components/AppBar";
import SideBar from "../components/SideBar";
import Box from "@mui/material/Box";


export default function BaseLayout({children}) {
  document.body.style = "background-color: #edf6ff"
  return (
    <>
      <AppBar />
      <SideBar />
      <Box sx={{
						my: 8,
						mx: 4,
            display: "flex",
						flexDirection: "column",
            alignItems: "center"
					}}>
        {children}
      </Box>
      
    </>
    
  );
}
