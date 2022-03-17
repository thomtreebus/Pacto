import { Box, Typography, Card, Fab } from "@mui/material";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import { useState } from "react";
import background from "../assets/hub-background.jpg";
import { Divider } from "@mui/material";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { useHistory } from "react-router-dom";
import PactGrid from "../components/PactGrid";
import { useQuery } from "react-query";
import { useAuth } from '../providers/AuthProvider';
import Loading from "./Loading";
import { useEffect } from "react";
import UserPortfolio from "../components/TabComponent/UserPortfolio";
import UserCard from "../components/UserCard";
import UserList from "../components/UserList";

export default function UserPage() {

    const { user } = useAuth();
	
	return (
        //<UserPortfolio user = {user}></UserPortfolio>
        <UserList users={[user, user, user, user]}></UserList>
    )
}
