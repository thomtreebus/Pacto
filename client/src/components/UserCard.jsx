import React, { useState } from "react";
import { Box, Grid, Card, CardHeader, Button, Avatar, CardContent, Typography } from "@mui/material"
import { useHistory } from "react-router-dom";

export default function UserCard({user}){

	const history = useHistory();

    function handleViewButtonClick() {
        history.push(`/user/${user._id}`);
    }
    
    return (
        <Box sx={{
            width: '100%',
            padding: "15px",
            }}
        >
            <Grid item xs={12} s={7}>
                <Card onClick={handleViewButtonClick} 
                        sx={{
                            display:"flex",
                            padding: "10px",
                            alignItems: "center",
                            position: "relative",
                            "&:hover": {
                                color: "#007FFF"
                            }
                        }}
                >
                    <CardHeader
                        avatar={<Avatar src={user.image} alt="user-image" />}
                        title={user.name}
                        sx={{ 
                            paddingBlock: 1,
                            padding: "8px",
                            display: "flex",
                            width: "60px", 
                            height: "60px", 
                            border: "2px solid #616161",                            
                            borderRadius: "170px", 
                            overflow: "hidden", 
                            position: "center",
                            borderColor: "inherit",
                        }}                   
                    />   
                    <Typography variant="h7" 
                        sx={{
                            // alignItems: "center",
                            // gap: "5px",
                            // textAlign: "center",
                            // borderRadius: "10px",
                            // justifyContent: "center",
                            paddingLeft: "25px",
                        }}
                    >
                        {user.firstName} {user.lastName}
                    </Typography>                                    
                </Card>
            </Grid>
        </Box>		
	);
}
