import { Link } from "react-router-dom"

export default function Landing() {
    document.body.style = "background-color: #2196f3"
    return (
        <div className="landing-page">
            <h1 className="landing-page-title">Welcome to Pacto</h1>
            <div className="login-buttons">
                <button to="/login">Login</button>
                <br />
                <button to="/signup">Signup</button>
            </div>
        </div>
    )
}
