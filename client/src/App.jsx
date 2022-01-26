import Login from "./pages/LoginPage";
import SignUp from "./pages/SignupPage";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

function App() {
	return (
		<Router>
			<Switch>
				<Route exact path="/">
					<h1>Landing Page</h1>
				</Route>
				<Route exact path="/login">
					<Login />
				</Route>
				<Route exact path="/signup">
					<SignUp />
				</Route>

				<Route path="*">
					<Router>
						Navbar
						<Switch>
							<Route exact path="/profile">
								<h1>Profile Page</h1>
							</Route>
							<Route path="*">
								<h1>Not Found Page</h1>
							</Route>
						</Switch>
					</Router>
				</Route>
			</Switch>
		</Router>
	);
}

export default App;
