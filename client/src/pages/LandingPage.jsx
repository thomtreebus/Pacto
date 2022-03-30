import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";

/**
 * Displays the landing page
 */
export default function LandingPage() {
	const history = useHistory();

	function handleClick() {
		history.push("/signup");
	}

	return (
		<>
			<div className="content">
				<div className="curve"></div>
			</div>
			<div className="container">
				<Typography variant="h1" sx={{ color: "white", fontWeight: "light" }}>
					Pacto
				</Typography>
				<Typography variant="h5" sx={{ color: "white", fontWeight: "bold" }}>
					The hub for students
				</Typography>
				<Button
					onClick={handleClick}
					variant="contained"
					sx={{
						color: "white",
						width: "70%",
						height: "45px",
						borderRadius: "15px",
						backgroundColor: "rgb(25,118,210)",
						fontWeight: "bold",
						border: "3px solid",

						"&:hover": {
							backgroundColor: "white",
							color: "rgb(25,118,210)",
							border: "3px solid",
							borderColor: "white",
						},
					}}
				>
					Join now!
				</Button>
				<Link to="/login" variant="body2" className="signin-link">
					Already have an account? Sign in
				</Link>
			</div>
		</>
	);
}
