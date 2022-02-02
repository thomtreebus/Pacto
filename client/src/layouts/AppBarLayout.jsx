
import React from 'react';
import AppBar from "../components/AppBar";
import Box from "@mui/material/Box";


export default function BaseLayout({children}) {
  document.body.style = "background-color: #edf6ff"
  return (
    <>
      <AppBar />
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