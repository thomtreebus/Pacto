import Login from "./pages/LoginPage";
import SignUp from "./pages/SignupPage";
import Profile from "./pages/Profile";
import BaseLayout from "./layouts/BaseLayout";
import Landing from "./pages/LandingPage";
import Feed from "./pages/Feed";
import EditPact from "./pages/EditPact"
import CreatePact from "./pages/CreatePact";
import { Route, Switch } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import EditProfile from "./pages/EditProfile";
import PrivateRoute from "./components/PrivateRoute";
import AuthRoute from "./components/AuthRoute";
import NotFound from "./pages/NotFound";
import UniversityHubPage from "./pages/UniversityHubPage";
import PactPage from "./pages/PactPage";
import PostPage from "./pages/PostPage";
import UserPage from "./pages/UserPage";
import SearchResults from "./pages/SearchResults";
import Verify from "./pages/Verify";
import { useHistory } from "react-router-dom";
import { useAuth } from "./providers/AuthProvider";

function App() {
	const history = useHistory();
	const {setActivePage} = useAuth();

	history.listen((location, action) => {
		setActivePage(location.pathname);
	});

	return (
		<>
			<CssBaseline />
			<Switch>
				<Route exact path="/">
					<Landing />
				</Route>
				<AuthRoute exact path="/verify/:id">
					<Verify />
				</AuthRoute>
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
							<PrivateRoute path="/pact/:pactId/edit-pact">
								<EditPact />
							</PrivateRoute>
							<PrivateRoute path="/feed">
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
							<PrivateRoute exact path="/pact/:pactID/post/:postID">
								<PostPage />
							</PrivateRoute>
							<PrivateRoute exact path="/users">
								<UserPage />
							</PrivateRoute>
							<PrivateRoute exact path="/search/:query">
								<SearchResults />
							</PrivateRoute>
							<PrivateRoute path="*">
								<NotFound />
							</PrivateRoute>
						</Switch>
					</BaseLayout>
				</PrivateRoute>
			</Switch>
		</>
	);
}

export default App;
