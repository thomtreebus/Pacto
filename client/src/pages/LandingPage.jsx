import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useHistory } from "react-router-dom";

export default function LandingPage() {
	const history = useHistory();

	function handleClick() {
		history.push("/login");
	}

	return (
		<>
			<div className="content"></div>
			<div className="container">
				<Typography variant="h1" sx={{ color: "white" }}>
					Pacto
				</Typography>
				<Typography variant="h5" sx={{ color: "white", fontWeight: "bold" }}>
					The hub for students
				</Typography>
				<Button
					onClick={handleClick}
					variant="contained"
					sx={{
						color: "black",
						width: "70%",
						height: "45px",
						borderRadius: "15px",
						backgroundColor: "white",
						fontWeight: "bold",
						"&:hover": {
							backgroundColor: "black",
							color: "white",
							border: "3px solid",
							borderColor: "white",
						},
					}}
				>
					Join now!
				</Button>
			</div>
			<img className="hero-img" alt="hero-img" />
		</>
	);
}
