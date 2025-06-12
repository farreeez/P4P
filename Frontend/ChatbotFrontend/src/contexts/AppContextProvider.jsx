// frontend/src/contexts/AppContextProvider.jsx
import { createContext, useEffect, useState } from "react";

export const AppContext = createContext({
	currentUser: null,
	login: () => {},
	logout: () => {},
	chatMessages: [],
	setChatMessages: () => {},
});

/**
 * Provides global state for the application.
 */
export function AppContextProvider({ children }) {
	const [currentUser, setCurrentUser] = useState(() => {
		const storedUser = localStorage.getItem("currentUser");
		return storedUser ? JSON.parse(storedUser) : null;
	});
	const [chatMessages, setChatMessages] = useState([]);


	// Update localStorage whenever currentUser
	useEffect(() => {
		if (currentUser) {
			localStorage.setItem("currentUser", JSON.stringify(currentUser));
		} else {
			localStorage.removeItem("currentUser");
		}

	}, [currentUser]);

	/**
	 * Login function to set the current user.
	 * @param user
	 */
	function login(user) {
		setCurrentUser(user);
	}

	/**
	 * Logout function to clear the current user.
	 */
	function logout() {
		setCurrentUser(null);
	}

	const context = {
		currentUser,
		setCurrentUser,
		login,
		logout,
		chatMessages,
		setChatMessages,
	};

	return (
		<AppContext.Provider value={context}>{children}</AppContext.Provider>
	);
}
