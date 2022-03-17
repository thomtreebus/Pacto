import React, { useState } from "react";
import { Box, Grid, Card, CardHeader, Button, Avatar, CardContent, Typography } from "@mui/material"
import { useHistory } from "react-router-dom";

export default function UserCard({user}){

	const history = useHistory();

    function handleViewButtonClick() {
        history.push(`/user/${user._id}`);
    }
    
    return (
        <Box sx={{width: '100%'}}>
            <Grid item xs={12}>
                <Card sx={{
                            display:"flex",
                        }}
                >
                    <CardHeader
                            avatar={<Avatar src={user.image} alt="user-image" />}
                            title={user.name}
                            sx={{ 
                                paddingBlock: 1,
                                display: "flex",
                                width: "75px", 
                                height: "75px", 
                                border: "3px solid #616161", 
                                borderRadius: "180px", 
                                overflow: "hidden", 
                                position: "center", 
                            }}                   
                    />   
                    <Button variant="h2" onClick={handleViewButtonClick}>
                            {user.firstName} {user.lastName} 
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "5px",
                                }}
                            >
                        </Box>
                    </Button> 
                                   
                </Card>
            </Grid>
        </Box>		
	);
}
