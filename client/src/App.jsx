import Login from "./pages/LoginPage";
import SignUp from "./pages/SignupPage";
import AppBar from "./components/AppBar";
import Landing from "./pages/LandingPage";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { CssBaseline } from "@mui/material";

function App() {
	return (
		<Router>
			<CssBaseline />
			<Switch>
				<Route exact path="/">
					<Landing />
				</Route>
				<Route exact path="/login">
					<Login />
				</Route>
				<Route exact path="/signup">
					<SignUp />
				</Route>

				<Route path="*">
					<AppBar />
					<Switch>
						<Route exact path="/profile">
							<h1>Profile Page</h1>
						</Route>
						<Route path="*">
							<h1>Not Found Page</h1>
						</Route>
					</Switch>
				</Route>
			</Switch>
		</Router>
	);
}

export default App;
