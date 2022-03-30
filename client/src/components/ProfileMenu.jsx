import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Divider from "@mui/material/Divider";

export default function ProfileMenu({
  profileMenuId, 
  profileAnchorEl, 
  isProfileMenuOpen,
  handleProfileMenuClose,
  handleProfileClick,
  handleEditProfileClick,
  handleLogout
}){
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
  