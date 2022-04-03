import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Profile from "./pages/users/profile/Profile";
import BaseLayout from "./layouts/BaseLayout";
import Landing from "./pages/Landing";
import Feed from "./pages/feed/Feed";
import EditPact from "./pages/university/pact/EditPact"
import CreatePact from "./pages/university/pact/CreatePact";
import { Route, Switch } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import EditProfile from "./pages/users/profile/EditProfile";
import PrivateRoute from "./components/PrivateRoute";
import AuthRoute from "./components/AuthRoute";
import NotFound from "./pages/NotFound";
import UniversityHub from "./pages/university/UniversityHub";
import Pact from "./pages/university/pact/Pact";
import Post from "./pages/university/pact/post/Post";
import Users from "./pages/users/Users";
import SearchResults from "./pages/SearchResults";
import Verify from "./pages/auth/Verify";
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
					<Signup />
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
								<UniversityHub />
							</PrivateRoute>
							<PrivateRoute exact path="/create-pact">
								<CreatePact />
							</PrivateRoute>
							<PrivateRoute exact path="/pact/:pactID">
								<Pact />
							</PrivateRoute>
							<PrivateRoute exact path="/pact/:pactID/post/:postID">
								<Post />
							</PrivateRoute>
							<PrivateRoute exact path="/users">
								<Users />
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
