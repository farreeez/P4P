import { ModalContext } from "../contexts/ModalContextProvider.jsx";
import { useContext } from "react";

/**
 * Custom hook to use the ModalContext
 */
export function useModal() {
	const context = useContext(ModalContext);

	if (context === undefined) {
		throw new Error("useModal must be used within a ModalProvider");
	}

	return context;
}
