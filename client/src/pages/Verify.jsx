import { useParams } from "react-router-dom";
import Button from "@mui/material/Button";
import React from "react";
import { useHistory } from "react-router-dom";
import Container from "@mui/material/Container";
import {Box} from "@mui/system";

export default function Verify() {
  const {verifyID} = useParams();
  const history = useHistory();
  const handleClick = async () => {
    const response = await fetch(`${process.env.REACT_APP_URL}/verify/${verifyID}`, {
      method: "GET",
    });
    await response;

    if(response.ok){
      history.push("/")
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Button
          label="Update Profile"
          sx={{
            float: "right",
            marginTop: { xs: 1, lg: 30 },
          }}
          variant="contained"
          type="submit"
          onClick={handleClick}
        >
        Verify account
      </Button>
      </Box>
    </Container>
  )
}
