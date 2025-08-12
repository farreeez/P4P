import { useContext } from "react";
import { AppContext } from "../contexts/AppContextProvider.jsx";
import { Navigate } from "react-router-dom";

/**
 * PublicRoute component is used to redirect authenticated users away from logic/registration page.
 * @param children
 * @returns {*|JSX.Element}
 */
export default function PublicRoute({ children }) {
	const { currentUser } = useContext(AppContext);
	return currentUser ? <Navigate to="/app/chat" replace /> : children;
}
