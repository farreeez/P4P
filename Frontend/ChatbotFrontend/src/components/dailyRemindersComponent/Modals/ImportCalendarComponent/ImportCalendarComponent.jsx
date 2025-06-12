import { Calendar } from "../../../../api/calendarApi.js";
import { useModal } from "../../../../hooks/useModal.js";
import { useContext, useRef, useState } from "react";
import "./ImportCalendarComponent.css";
import CalendarParser from "../../../../utils/CalendarParser.js";
import { AppContext } from "../../../../contexts/AppContextProvider.jsx";
import { toast } from "react-toastify";

/**
 * Import calendar component.
 */
export default function ImportCalendarComponent({ onEventsImported }) {
	// Modal service
	const { closeModal } = useModal();

	// Hooks
	const { currentUser } = useContext(AppContext);
	const { createEvent } = Calendar.createAsync();

	// Files
	const [file, setFile] = useState(null);
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef(null);

	/**
	 * Open file dialog when dropbox is clicked
	 */
	const handleBoxClick = () => {
		fileInputRef.current.click();
	};

	/**
	 * Handle file selection change
	 */
	const handleFileChange = e => {
		const selectedFile = e.target.files[0];
		if (selectedFile && selectedFile.name.endsWith(".ics")) {
			setFile(selectedFile);
		} else {
			toast.warn("Please select a valid .ics file");
		}
	};

	/**
	 * Handle drag events
	 */
	const handleDrag = e => {
		e.preventDefault();
		e.stopPropagation();

		if (e.type === "dragenter" || e.type === "dragover") {
			setIsDragging(true);
		} else if (e.type === "dragleave") {
			setIsDragging(false);
		}
	};

	/**
	 * Handle drop event
	 */
	const handleDrop = e => {
		e.preventDefault();
		e.stopPropagation();

		setIsDragging(false);

		const droppedFile = e.dataTransfer.files[0];
		if (droppedFile && droppedFile.name.endsWith(".ics")) {
			setFile(droppedFile);
		} else {
			toast.warn("Please drop a valid .ics file");
		}
	};

	/**
	 * Upload events to database.
	 */
	async function handleSubmit(e) {
		e.preventDefault();

		if (!file) {
			toast.warn("Please select a file first");
			return;
		}

		// Read file contents and persist to database
		const events = await CalendarParser(file, currentUser?.id);
		for (const event of events) {
			console.log(event);
			await createEvent(event);
		}

		// Refresh events
		onEventsImported();

		closeModal();
	}

	/**
	 * Close modal.
	 */
	function handleCancel() {
		closeModal();
	}

	return (
		<div style={{ width: "400px" }}>
			<div className="event-form-header">
				<h2>Import Calendar</h2>
			</div>

			<form onSubmit={handleSubmit}>
				<div
					className={`file-drop-area ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
					onClick={handleBoxClick}
					onDragEnter={handleDrag}
					onDragOver={handleDrag}
					onDragLeave={handleDrag}
					onDrop={handleDrop}
				>
					<input
						type="file"
						ref={fileInputRef}
						accept=".ics"
						onChange={handleFileChange}
						style={{ display: "none" }}
					/>

					{file ? (
						<div className="file-info">
							<span className="file-name">{file.name}</span>
							<span className="file-size">
								({(file.size / 1024).toFixed(2)} KB)
							</span>
						</div>
					) : (
						<div className="drop-message">
							<span className="icon">
								<i className="fas fa-calendar"></i>
							</span>
							<p>
								Drag & drop an .ics file here, or click to
								select
							</p>
						</div>
					)}
				</div>

				<div className="button-container calendar-button-container">
					<button
						type="button"
						className="button-secondary"
						onClick={handleCancel}
					>
						<i className="fas fa-times"></i>&nbsp;Cancel
					</button>
					<button type="submit" className="button-primary">
						<i className="fas fa-upload"></i>&nbsp;Import Events
					</button>
				</div>
			</form>
		</div>
	);
}
