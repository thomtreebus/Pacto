import Login from "./pages/LoginPage";
import SignUp from "./pages/SignupPage";
import BaseLayout from "./layouts/BaseLayout";
import Landing from "./pages/LandingPage";
import Feed from "./pages/Feed";
import EditPact from "./pages/EditPact"
import CreatePact from "./pages/CreatePact";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import AuthRoute from "./components/AuthRoute";
import NotFound from "./pages/NotFound";
import UniversityHubPage from "./pages/UniversityHubPage";
import PactPage from "./pages/PactPage";


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
								<h2>Profile</h2>
								<Profile />
							</PrivateRoute>
							<PrivateRoute path="/pact/:pactId/edit-pact">
								<EditPact />
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
