import { useContext } from "react";
import { AppContext } from "../contexts/AppContextProvider.jsx";
import { Navigate } from "react-router-dom";

/**
 * PrivateRoute component is used to protect routes that require authentication.
 * @param children
 * @returns {*|JSX.Element}
 * @constructor
 */
export default function PrivateRoute({ children }) {
	const { currentUser } = useContext(AppContext);
	return currentUser ? children : <Navigate to="/" replace />;
}
