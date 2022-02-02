import Login from "./pages/LoginPage";
import SignUp from "./pages/SignupPage";
import BaseLayout from "./layouts/BaseLayout";
import AppBarLayout from "./layouts/AppBarLayout";
import Landing from "./pages/LandingPage";
import Feed from "./pages/Feed";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import Profile from "./pages/Profile";

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
				<Route exact path="/profile">
					<AppBarLayout>
						<Profile />
					</AppBarLayout>
				</Route>

				<Route path="*">
					<BaseLayout>
					<Switch>
						<Route exact path="/profile">
							<h1>Profile Page</h1>
						</Route>
						<Route exact path="/feed">
							<h1>Feed</h1>
							<Feed />
						</Route>
						<Route path="*">
							<h1>Not Found Page</h1>
						</Route>
					</Switch>
					</BaseLayout>
					
				</Route>
			</Switch>
		</Router>
	);
}

export default App;
