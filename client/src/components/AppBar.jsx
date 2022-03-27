import React from "react";
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
import MoreIcon from "@mui/icons-material/MoreVert";
import { Link, useHistory } from "react-router-dom";
import { ButtonBase } from "@mui/material";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import { useAuth } from "../providers/AuthProvider";
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

	const { user, silentUserRefresh } = useAuth();

	const [anchorEl, setAnchorEl] = React.useState(null);
	const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
	const [search, setSearch] = React.useState("");

	const isMenuOpen = Boolean(anchorEl);
	const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

	const handleLogout = async () => {
		await fetch(`${process.env.REACT_APP_URL}/logout`, {
			credentials: "include",
		});
		silentUserRefresh();
	};

	const handleProfileMenuOpen = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMobileMenuClose = () => {
		setMobileMoreAnchorEl(null);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
		handleMobileMenuClose();
	};

	const handleMobileMenuOpen = (event) => {
		setMobileMoreAnchorEl(event.currentTarget);
	};

	const handleEditProfileClick = () => {
		history.push("/edit-profile");
		handleMenuClose();
	};

	const handleProfileClick = () => {
		history.push("/user/" + user._id);
		handleMenuClose();
	};

	const handleSearch = () => {
		if(!search) return; 
		history.push(`/search/${search}`);
	}

	const keyPress = (e) => {
		if (e.keyCode === 13) {
			handleSearch();
		}
	}

	const menuId = "primary-search-account-menu";
	const renderMenu = (
		<Menu
			data-testid={menuId}
			anchorEl={anchorEl}
			anchorOrigin={{
				vertical: "top",
				horizontal: "right",
			}}
			id={menuId}
			keepMounted
			transformOrigin={{
				vertical: "top",
				horizontal: "right",
			}}
			open={isMenuOpen}
			onClose={handleMenuClose}
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

	const mobileMenuId = "primary-search-account-menu-mobile";
	const renderMobileMenu = (
		<Menu
			data-testid={mobileMenuId}
			anchorEl={mobileMoreAnchorEl}
			anchorOrigin={{
				vertical: "top",
				horizontal: "right",
			}}
			id={mobileMenuId}
			keepMounted
			transformOrigin={{
				vertical: "top",
				horizontal: "right",
			}}
			open={isMobileMenuOpen}
			onClose={handleMobileMenuClose}
		>
			<MenuItem
				data-testid="profile-item-mobile"
				onClick={handleMobileMenuClose}
			>
				<IconButton
					size="large"
					aria-label="account of current user"
					aria-controls="primary-search-account-menu"
					aria-haspopup="true"
					color="inherit"
				>
					<AccountCircle />
				</IconButton>
				<p>Profile</p>
			</MenuItem>
			<Divider />
			<MenuItem data-testid="logout-item-mobile" onClick={handleLogout}>
				<p>Log Out</p>
			</MenuItem>
		</Menu>
	);

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
						<ButtonBase
							sx={{ borderRadius: "50%" }}
							data-testid="home-button"
							component={Link}
							to="/feed"
						>
							<Avatar src={PactoIcon} alt="Pacto Icon" />
						</ButtonBase>
					</Typography>
					<Search data-testid="search-bar">
						<SearchIconWrapper>
							<SearchIcon data-testid="search-icon" />
						</SearchIconWrapper>
						<StyledInputBase
							placeholder="Search…"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							inputProps={{ "aria-label": "search" }}
							onKeyDown={keyPress}
						/>
					</Search>
					<Box sx={{ flexGrow: 1 }} />
					<Box sx={{ display: { xs: "none", md: "flex" } }}>
						<IconButton
							data-testid="profile-button"
							size="large"
							edge="end"
							aria-label="account of current user"
							aria-controls={menuId}
							aria-haspopup="true"
							onClick={handleProfileMenuOpen}
							color="inherit"
						>
							<AccountCircle data-testid="account-circle" />
						</IconButton>
					</Box>
					<Box sx={{ display: { xs: "flex", md: "none" } }}>
						<IconButton
							data-testid="mobile-menu-button"
							size="large"
							aria-label="show more"
							aria-controls={mobileMenuId}
							aria-haspopup="true"
							onClick={handleMobileMenuOpen}
							color="inherit"
						>
							<MoreIcon data-testid="more-button" />
						</IconButton>
					</Box>
				</Toolbar>
			</AppBar>
			{renderMobileMenu}
			{renderMenu}
		</Box>
	);
}
