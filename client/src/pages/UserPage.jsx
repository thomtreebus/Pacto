import { useState } from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from '../providers/AuthProvider';
import Loading from "./Loading";
import { useEffect } from "react";
import UserList from "../components/UserList";

export default function UserPage() {

    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [allUsers, setAllUsers] = useState(null);
    const history = useHistory();

    useEffect(() => {
    fetch(`${process.env.REACT_APP_URL}/users`, {
      method: "GET",
      credentials: "include"
    }).then((res) => {
      if (!res.ok) {
        throw Error("Could not fetch pact");
      }
      return res.json();
    }).then((data) => {
      setAllUsers(data.message);
      setIsLoading(false);
    }).catch(() => {
      history.push("/not-found");
    })
  }, [])

  if(isLoading){
    return (
      <Loading/>
    )
  }
	
	return (
        //<UserPortfolio user = {user}></UserPortfolio>
        <UserList users={allUsers}></UserList>
    )
}
