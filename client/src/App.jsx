import Login from "./pages/LoginPage";
import SignUp from "./pages/SignupPage";
import Profile from "./pages/Profile";
import BaseLayout from "./layouts/BaseLayout";
import Landing from "./pages/LandingPage";
import Feed from "./pages/Feed";
import CreatePact from "./pages/CreatePact";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import EditProfile from "./pages/EditProfile";
import PrivateRoute from "./components/PrivateRoute";
import AuthRoute from "./components/AuthRoute";
import NotFound from "./pages/NotFound";
import UniversityHubPage from "./pages/UniversityHubPage";
import PactPage from "./pages/PactPage";
import UserPage from "./pages/UserPage";

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
							<PrivateRoute path="/edit-profile">
								<EditProfile />
							</PrivateRoute>
							<PrivateRoute path="/user/:id">
								<Profile />
							</PrivateRoute>
							<PrivateRoute path="/feed">
								<h1>Feed</h1>
								<Feed />
							</PrivateRoute>
							<PrivateRoute exact path="/hub">
								<UniversityHubPage />
							</PrivateRoute>
							<PrivateRoute exact path="/create-pact">
								<CreatePact />
							</PrivateRoute>
							<PrivateRoute exact path="/pact/:pactID">
								<PactPage />
							</PrivateRoute>
							<PrivateRoute exact path="/users">
								<UserPage />
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
