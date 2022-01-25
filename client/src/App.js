import logo from './logo.svg';
import './App.css';
import Login from './templates/Login';
import SignUp from './templates/SignUp';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <div className="Authentication">
          <Router>
            <Switch>
              <Route exact path="/"> <Login /> </Route>
              <Route path="/sign-up"> <SignUp /> </Route>
            </Switch>
          </Router>
        </div>
      </div> 
    </Router>
    
  );
}

export default App;
