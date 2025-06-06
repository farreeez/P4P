import { createContext, useState } from "react";
import Modal from "react-modal";

export const ModalContext = createContext({
	openModal: () => {},
	closeModal: () => {},
});

/**
 * Custom modal service.
 */
export function ModalContextProvider({ children }) {
	const [modalContent, setModalContent] = useState(null);
	const [isOpen, setIsOpen] = useState(false);
	const [isClosing, setIsClosing] = useState(false);

	/**
	 * Open modal with content
	 * @param content
	 */
	function openModal(content) {
		setModalContent(content);
		setIsOpen(true);
		setIsClosing(false);
	}

	/**
	 * Close modal
	 */
	function closeModal() {
		setIsClosing(true);
		setTimeout(() => {
			setIsOpen(false);
			setModalContent(null);
			setIsClosing(false);
		}, 100);
	}

	const context = {
		openModal,
		closeModal,
	};

	return (
		<ModalContext.Provider value={context}>
			{children}
			<Modal
				isOpen={isOpen}
				onRequestClose={closeModal}
				contentLabel="Modal"
				className={`modal-content ${isClosing ? "closing" : ""}`}
				overlayClassName={`modal-overlay ${isClosing ? "closing" : ""}`}
			>
				{modalContent}
			</Modal>
		</ModalContext.Provider>
	);
}
