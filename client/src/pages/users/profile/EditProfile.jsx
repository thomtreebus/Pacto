/**
 * A page to edit the user's profile
 */

import React, { useEffect, useState } from "react";
import Axios from "axios";
import { useHistory } from "react-router-dom";
import { Image } from "cloudinary-react";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import LocationIcon from "@mui/icons-material/LocationOn";
import CourseIcon from "@mui/icons-material/School";
import PhotoIcon from "@mui/icons-material/AddAPhoto";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { Divider } from "@mui/material";
import Loading from "../../../components/Loading";
import { useAuth } from "../../../providers/AuthProvider";
import ErrorMessage from "../../../components/errors/ErrorMessage";

const Input = styled("input")({
	display: "none",
});

/**
 * Gives the user the ability to edit details displayed
 * on their profile excluding their name.
 * @returns {JSX.Element}
 */
export default function EditProfile() {
	const { user, silentUserRefresh } = useAuth();

	const history = useHistory();

	const [editProfileIsDisabled, setEditProfileIsDisabled] = useState(false);
	const [uploadImageIsDisabled, setUploadImageIsDisabled] = useState(false);
	const [snackbarOpen, setSnackbarOpen] = useState(false);

	const [isLoading, setIsLoading] = useState(true);

	const [bio, setBio] = useState("");
	const [location, setLocation] = useState("");
	const [course, setCourse] = useState("");
	const [linkedin, setLinkedin] = useState("");
	const [instagram, setInstagram] = useState("");
	const [phone, setPhone] = useState("");
	const [image, setImage] = useState("");

	const [apiBioError, setApiBioError] = useState("");
	const [apiLocationError, setApiLocationError] = useState("");
	const [uploadImageError, setUploadImageError] = useState("");
	const [apiCourseError, setApiCourseError] = useState("");
	const [apiLinkedInError, setApiLinkedInError] = useState("");
	const [apiInstagramError, setApiInstagramError] = useState("");
	const [apiPhoneError, setApiPhoneError] = useState("");

	const uploadImage = async (newImage) => {
		setUploadImageIsDisabled(true);
		const data = new FormData();

		data.append("api_key", process.env.REACT_APP_CLOUDINARY_KEY);
		data.append("file", newImage);
		data.append("upload_preset", process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);

		try {
			const res = await Axios.post(
				`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
				data
			);
			setImage(res.data.url);
			setSnackbarOpen(false);
		} catch (err) {
			setUploadImageError("Error uploading image");
			setSnackbarOpen(true);
		}
		setUploadImageIsDisabled(false);
	};

	useEffect(() => {
		if (user !== undefined) {
			setBio(user.bio);
			setLocation(user.location);
			setCourse(user.course);
			setLinkedin(user.linkedin);
			setInstagram(user.instagram);
			setPhone(user.phone);
			setImage(user.image);
			setIsLoading(false);
		}
	}, [user]);

	const handleSubmit = async (event) => {
		setEditProfileIsDisabled(true);
		event.preventDefault();

		const payload = {
			bio,
			location,
			course,
			linkedin,
			instagram,
			phone,
			image,
		};
		const res = await fetch(`${process.env.REACT_APP_URL}/users/${user._id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify(payload),
		});

		const resJson = await res.json();

		//redirects user when form is correct
		if (res.status === 200) {
			await silentUserRefresh();
			return history.push("/user/" + user._id);
		}

		// Displays errors retrieved from response
		Object.values(resJson["errors"]).forEach((err) => {
			const field = err["field"];
			const message = err["message"];

			if (field === "instagram") {
				setApiInstagramError(message);
			} else if (field === "linkedin") {
				setApiLinkedInError(message);
			} else if (field === "phone") {
				setApiPhoneError(message);
			} else if (field === "course") {
				setApiCourseError(message);
			} else if (field === "location") {
				setApiLocationError(message);
			} else if (field === "bio") {
				setApiBioError(message);
			}
		});

		setEditProfileIsDisabled(false);
	};

	if (isLoading) {
		return <Loading />;
	} else {
		return (
			<Grid
				component="form"
				noValidate
				onSubmit={handleSubmit}
				container
				p={4}
				spacing={2}
				justify="center"
				justifyContent="center"
				sx={{ flexDirection: { xs: "column-reverse", lg: "row" } }}
				alignItems="stretch"
			>
				<Grid item container direction="column" xs={12} lg={4}>
					<Image
						style={{
							width: "100%",
							minWidth: "50%",
							minHeight: "25%",
							borderRadius: "10px",
							overflow: "hidden",
							position: "relative",
						}}
						alt="Profile Picture"
						cloudName={`${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}`}
						publicID={image}
					/>
					<Stack direction="row" alignItems="center" spacing={2}>
						<label htmlFor="contained-button-file">
							<Input
								accept="image/*"
								id="contained-button-file"
								data-testid="image-upload-icon"
								disabled={uploadImageIsDisabled}
								type="file"
								onChange={(e) => {
									uploadImage(e.target.files[0]);
								}}
							/>
							<IconButton
								color="primary"
								component="span"
								disabled={uploadImageIsDisabled}
							>
								<PhotoIcon />
							</IconButton>
						</label>
					</Stack>
					<Divider sx={{ margin: 1, width: "97%" }} />
					<Typography
						variant="subtitle1"
						sx={{
							marginTop: 1,
							marginLeft: 0,
							color: "#6d7175",
						}}
					>
						{user.friends.length} Friends
					</Typography>
					<Divider sx={{ margin: 1, width: "97%" }} />
					<TextField
						name="location"
						label="Location"
						variant="outlined"
						helperText={apiLocationError}
						fullWidth
						defaultValue={location}
						onChange={(e) => {
							setLocation(e.target.value);
						}}
						size="small"
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<LocationIcon />
								</InputAdornment>
							),
						}}
						sx={{
							marginTop: 1,
						}}
					/>
					<TextField
						name="course"
						label="Course"
						variant="outlined"
						helperText={apiCourseError}
						size="small"
						fullWidth
						defaultValue={course}
						onChange={(e) => setCourse(e.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<CourseIcon />
								</InputAdornment>
							),
						}}
						sx={{
							marginTop: 1,
						}}
					/>
					<TextField
						name="linkedin"
						label="LinkedIn"
						variant="outlined"
						helperText={apiLinkedInError}
						size="small"
						fullWidth
						defaultValue={linkedin}
						onChange={(e) => setLinkedin(e.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<LinkedInIcon />
								</InputAdornment>
							),
						}}
						sx={{
							marginTop: 1,
						}}
					/>
					<TextField
						name="instagram"
						label="Instagram"
						helperText={apiInstagramError}
						variant="outlined"
						size="small"
						fullWidth
						defaultValue={instagram}
						onChange={(e) => setInstagram(e.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<InstagramIcon />
								</InputAdornment>
							),
						}}
						sx={{
							marginTop: 1,
						}}
					/>
					<TextField
						name="phone"
						label="Phone Number"
						helperText={apiPhoneError}
						variant="outlined"
						size="small"
						fullWidth
						defaultValue={phone}
						onChange={(e) => setPhone(e.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<WhatsAppIcon />
								</InputAdornment>
							),
						}}
						sx={{
							marginTop: 1,
						}}
					/>
				</Grid>
				<Grid item container direction="column" xs={12} lg={8}>
					<Typography variant="h4">
						{user.firstName} {user.lastName}
					</Typography>
					<Typography variant="subtitle1" sx={{ color: "#1976d2" }}>
						{" "}
						{user.university.name}{" "}
					</Typography>
					<TextField
						name="bio"
						label="Bio"
						helperText={apiBioError}
						multiline
						rows={6}
						defaultValue={bio}
						onChange={(e) => {
							setBio(e.target.value);
						}}
						sx={{
							marginTop: 2,
							width: "100%",
						}}
					/>
					<Button
						label="Update Profile"
						sx={{
							float: "right",
							marginTop: { xs: 1, lg: 30 },
						}}
						variant="contained"
						type="submit"
						disabled={editProfileIsDisabled}
					>
						Update Profile
					</Button>
				</Grid>
				<ErrorMessage
					isOpen={snackbarOpen}
					setIsOpen={setSnackbarOpen}
					message={uploadImageError}
				/>
			</Grid>
		);
	}
}
