/**
 * A menu for the app bar
 */

import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Divider from "@mui/material/Divider";
import { useHistory } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

/**
 * A menu to be shown on the app bar
 */
export default function ProfileMenu({
  profileMenuId, 
  profileAnchorEl, 
  isProfileMenuOpen,
  handleProfileMenuClose
}){
  const history = useHistory();
  const { user, silentUserRefresh } = useAuth();

  const handleEditProfileClick = () => {
		history.push("/edit-profile");
		handleProfileMenuClose();
	};

	const handleProfileClick = () => {
		history.push("/user/" + user._id);
		handleProfileMenuClose();
	};

  const handleLogout = async () => {
		await fetch(`${process.env.REACT_APP_URL}/logout`, {
			credentials: "include",
		});
		await silentUserRefresh();
	};
  
  return (
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
}
  