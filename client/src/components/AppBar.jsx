import React, { useState } from "react";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { Link, useHistory } from "react-router-dom";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import { useAuth } from "../providers/AuthProvider";
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import PactoIcon from "../assets/pacto-logo.png";
import MenuIcon from "@mui/icons-material/Menu";

const Search = styled("div")(({ theme }) => ({
	position: "relative",
	borderRadius: theme.shape.borderRadius,
	backgroundColor: alpha(theme.palette.common.white, 0.15),
	"&:hover": {
		backgroundColor: alpha(theme.palette.common.white, 0.25),
	},
	marginRight: theme.spacing(2),
	marginLeft: 0,
	width: "100%",
	[theme.breakpoints.up("sm")]: {
		marginLeft: theme.spacing(3),
		width: "auto",
	},
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
	padding: theme.spacing(0, 2),
	height: "100%",
	position: "absolute",
	pointerEvents: "none",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
	color: "inherit",
	"& .MuiInputBase-input": {
		padding: theme.spacing(1, 1, 1, 0),
		// vertical padding + font size from searchIcon
		paddingLeft: `calc(1em + ${theme.spacing(4)})`,
		transition: theme.transitions.create("width"),
		width: "100%",
		[theme.breakpoints.up("md")]: {
			width: "20ch",
		},
	},
}));

export default function PrimarySearchAppBar({ handleDrawerToggle }) {
	const history = useHistory();

	const { user, setIsAuthenticated } = useAuth();

	const [profileAnchorEl, setProfileAnchorEl] = useState(null);
	const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);

	const isProfileMenuOpen = Boolean(profileAnchorEl);
	const isNotificationsMenuOpen = Boolean(notificationsAnchorEl);
	
	function getNotificationCount(user) {
		if (user.notifications === undefined) {
			return 0
		}
		else {
			return user.notifications.length
		}
	}

	const handleLogout = async () => {
		await fetch(`${process.env.REACT_APP_URL}/logout`, {
			credentials: "include",
		});
		setIsAuthenticated(false);
		history.push("login");
	};

	const handleProfileMenuOpen = (event) => {
		setProfileAnchorEl(event.currentTarget);
	};

	const handleProfileMenuClose = () => {
		setProfileAnchorEl(null);
	};

	const handleEditProfileClick = () => {
		history.push("/edit-profile");
		handleProfileMenuClose();
	};

	const handleProfileClick = () => {
		history.push("/user/" + user._id);
		handleProfileMenuClose();
	};

	const handleNotificationsMenuOpen = (event) => {
		setNotificationsAnchorEl(event.currentTarget);
	};

	const handleNotificationsMenuClose = () => {
		setNotificationsAnchorEl(null);
	}

	const profileMenuId = "primary-search-account-menu";
	const renderProfileMenu = (
		<Menu
			data-testid={profileMenuId}
			anchorEl={profileAnchorEl}
			anchorOrigin={{
				vertical: "top",
				horizontal: "right",
			}}
			id={profileMenuId}
			keepMounted
			transformOrigin={{
				vertical: "top",
				horizontal: "right",
			}}
			open={isProfileMenuOpen}
			onClose={handleProfileMenuClose}
		>
			<MenuItem data-testid="profile-item" onClick={handleProfileClick}>
				Profile
			</MenuItem>
			<MenuItem
				data-testid="edit-profile-item"
				onClick={handleEditProfileClick}
			>
				Edit Profile
			</MenuItem>
			<Divider />
			<MenuItem data-testid="logout-item" onClick={handleLogout}>
				Log Out
			</MenuItem>
		</Menu>
	);

	const notificationsMenuId = "notifications-menu"
	const renderNotificationsMenu = (
		<Menu
			data-testid={notificationsMenuId}
			anchorEl={notificationsAnchorEl}
			anchorOrigin={{
				vertical: "middle",
				horizontal: "right",
			}}
			id={notificationsMenuId}
			keepMounted
			transformOrigin={{
				vertical: "middle",
				horizontal: "right",
			}}
			open={isNotificationsMenuOpen}
			onClose={handleNotificationsMenuClose}
		>
			<MenuItem onClick={handleNotificationsMenuClose}>
				Test
			</MenuItem>
		</Menu>
	)

	return (
		<Box sx={{ flexGrow: 1 }}>
			<AppBar
				data-testid="app-bar"
				position="fixed"
				sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
				style={{ background: "#2E3B55" }}
			>
				<Toolbar>
					<IconButton
						color="inherit"
						aria-label="open drawer"
						edge="start"
						onClick={handleDrawerToggle}
						sx={{ mr: 2, display: { sm: "none" } }}
						data-testid="sidebar-menu-button"
					>
						<MenuIcon />
					</IconButton>
					<Typography
						variant="h6"
						noWrap
						component="div"
						sx={{ display: { xs: "none", sm: "block" } }}
					>
						<Button
							data-testid="home-button"
							component={Link}
							to="/feed"
							startIcon={<Avatar src={PactoIcon} alt="Pacto Icon" />}
						/>
					</Typography>
					<Search data-testid="search-bar">
						<SearchIconWrapper>
							<SearchIcon data-testid="search-icon" />
						</SearchIconWrapper>
						<StyledInputBase
							placeholder="Search…"
							inputProps={{ "aria-label": "search" }}
						/>
					</Search>
					<Box sx={{ flexGrow: 1 }} />
						<IconButton
							size="large"
							edge="end"
							aria-label="notifications"
							color="inherit"
							aria-controls={notificationsMenuId}
							aria-haspopup="true"
							onClick={handleNotificationsMenuOpen}
						>
							<Badge data-testid="badge" badgeContent={ getNotificationCount(user) } max={99} color="error">
								<NotificationsIcon />
							</Badge>
						</IconButton>
					<Box>
						<IconButton
							data-testid="profile-button"
							size="large"
							edge="end"
							aria-label="account of current user"
							aria-controls={profileMenuId}
							aria-haspopup="true"
							onClick={handleProfileMenuOpen}
							color="inherit"
						>
							<AccountCircle data-testid="account-circle" />
						</IconButton>
					</Box>
				</Toolbar>
			</AppBar>
			{renderProfileMenu}
			{renderNotificationsMenu}
		</Box>
	);
}
