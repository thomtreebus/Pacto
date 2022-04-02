/**
 * A card to display a user and sent or accept requests
 */

import { Box, Grid, Card, CardHeader, Avatar, Typography } from "@mui/material"
import { useHistory } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import FriendButtons from "./FriendButtons";

/**
 * A card to display information about a user
 * @param {Object} user The user being displayed
 */
export default function UserCard({user}){

    const {user: currentUser} = useAuth();

	const history = useHistory();

    function handleViewButtonClick() {
        history.push(`/user/${user._id}`);
    }
    
    return (
        <Box sx={{
            width: '100%',
            padding: "6px",
            }}
        >
            <Grid item xs={12} s={7}>
                <Card   data-testid="userCard"
                        sx={{
                            display:"flex",
                            padding: "10px",
                            alignItems: "center",
                            position: "relative",
                        }}
                >
                    <CardHeader onClick={handleViewButtonClick}
                        avatar={<Avatar src={user.image} alt="user-image" />}
                        title={user.name} data-testid="user-image"
                        sx={{ 
                            paddingBlock: 1,
                            padding: "8px",
                            display: "flex",
                            width: "60px", 
                            height: "60px", 
                            overflow: "hidden", 
                            position: "center",
                            borderColor: "inherit",
                        }}                   
                    />

                    <Typography variant="h7" onClick={handleViewButtonClick} data-testid="user-name"
                        sx={{
                            paddingLeft: "25px",
                            paddingRight: "25px",
                        }}
                    >{user.firstName} {user.lastName}</Typography>

                    <FriendButtons currentUser={currentUser} user={user} />                    
                </Card>
            </Grid>
        </Box>		
	);
}
