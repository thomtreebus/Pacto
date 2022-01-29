import Login from "./pages/LoginPage";
import SignUp from "./pages/SignupPage";
import BaseLayout from "./layouts/BaseLayout";
import Landing from "./pages/LandingPage";
import Feed from "./pages/Feed";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import PrivateRoute from "./components/PrivateRoute";
import AuthRoute from "./components/AuthRoute";

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
							<PrivateRoute exact path="/profile">
								<h1>Profile Page</h1>
							</PrivateRoute>
							<PrivateRoute exact path="/feed">
								<h1>Feed</h1>
								<Feed />
							</PrivateRoute>
							<PrivateRoute path="*">
								<h1>Not Found Page</h1>
							</PrivateRoute>
						</Switch>
					</BaseLayout>
				</PrivateRoute>
			</Switch>
		</Router>
	);
}

export default App;
