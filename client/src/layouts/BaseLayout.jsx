
import React from 'react';
import AppBar from "../components/AppBar";
import SideBar from "../components/SideBar";
import Box from "@mui/material/Box";


export default function BaseLayout({children}) {
  document.body.style = "background-color: #edf6ff"
  return (
    <>
      <AppBar />
      <Box sx={{display:'flex', alignItems: "center", maxWidth: "100%"}}>
      <SideBar />
      <Box sx={{
						my: 8,
            display: "flex",
						flexDirection: "column",
            alignItems: "center",
            flex: "1",
      }}>
        {children}
      </Box>
      <SideBar temp />
      </Box>
    </>
    
  );
}
