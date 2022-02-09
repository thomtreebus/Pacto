import Login from "./pages/LoginPage";
import SignUp from "./pages/SignupPage";
import BaseLayout from "./layouts/BaseLayout";
import Landing from "./pages/LandingPage";
import Feed from "./pages/Feed";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import AuthRoute from "./components/AuthRoute";
import NotFound from "./pages/NotFound";
import UniversityHubPage from "./pages/UniversityHubPage";

function App() {
	return (
		<Router>
			<CssBaseline />
			<Switch>
				<Route exact path="/">
					<Landing />
				</Route>
				<AuthRoute exact path="/login">
					<Login />
				</AuthRoute>
				<AuthRoute exact path="/signup">
					<SignUp />
				</AuthRoute>

				<PrivateRoute path="*">
					<BaseLayout>
						<Switch>
							<PrivateRoute path="/profile">
								<Profile />
							</PrivateRoute>
							<PrivateRoute path="/feed">
								<h1>Feed</h1>
								<Feed />
							</PrivateRoute>
							<PrivateRoute exact path="/hub">
								<UniversityHubPage />
							</PrivateRoute>
							<PrivateRoute path="*">
								<NotFound />
							</PrivateRoute>
						</Switch>
					</BaseLayout>
				</PrivateRoute>
			</Switch>
		</Router>
	);
}

export default App;
