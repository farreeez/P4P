import { useContext, useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { AppContext } from "../../../../contexts/AppContextProvider.jsx";
import { useModal } from "../../../../hooks/useModal.js";
import { Calendar } from "../../../../api/calendarApi.js";
import CalendarEventFormComponent from "../../CalendarEventFormComponent/CalendarEventFormComponent.jsx";

/**
 * Edit calendar event modal component
 */
export default function EditCalendarEventComponent({ event, onEventUpdated }) {
	const { currentUser } = useContext(AppContext);
	const { closeModal } = useModal();
	const { updateEvent } = Calendar.updateAsync();
	const { deleteEvent } = Calendar.deleteAsync();

	const [formData, setFormData] = useState({
		eventName: "",
		eventDescription: "",
		eventDate: new Date(),
		startTime: new Date(),
		endTime: new Date(),
		category: "Work",
		isPrivate: true,
		userId: currentUser?.id,
	});

	useEffect(() => {
		if (event) {
			setFormData({
				eventName: event.title || "",
				eventDescription: event.eventDescription || "",
				eventDate: event.start || new Date(),
				startTime: event.start || new Date(),
				endTime: event.end || new Date(),
				category: event.category || "Work",
				isPrivate: event.isPrivate || false,
				userId: event.userId || currentUser?.id,
			});
		}
	}, [event, currentUser]);

	/**
	 * Handle input change for text and checkbox fields.
	 */
	function handleInputChange(e) {
		const { name, value, type, checked } = e.target;
		setFormData({
			...formData,
			[name]: type === "checkbox" ? checked : value,
		});
	}

	/**
	 * Update date value in formData.
	 */
	function handleDateChange(name, value) {
		const updatedData = { ...formData, [name]: value };

		// Update start and end dates if event date is changed
		if (name === "eventDate") {
			/**
			 * Update time based on the selected date.
			 */
			function updateTime(time) {
				const updatedTime = new Date(value);
				updatedTime.setHours(time.getHours(), time.getMinutes());
				return updatedTime;
			}

			updatedData.startTime = updateTime(formData.startTime);
			updatedData.endTime = updateTime(formData.endTime);
		}

		setFormData(updatedData);
	}

	/**
	 * Update event.
	 */
	async function handleSubmit(e) {
		e.preventDefault();

		// Persist the event data and refresh the events
		await updateEvent(event.id, formData);
		onEventUpdated();

		closeModal();
	}

	/**
	 * Close modal.
	 */
	function handleClose() {
		closeModal();
	}

	/**
	 * Delete event.
	 */
	async function handleDelete() {
		await deleteEvent(event.id);
		onEventUpdated();
		closeModal();
	}

	return (
		<div>
			<div className="event-form-header">
				<h2>Edit Event</h2>
				<p>Update your calendar event.</p>
			</div>

			<form onSubmit={handleSubmit}>
				<CalendarEventFormComponent
					formData={formData}
					handleInputChange={handleInputChange}
					handleDateChange={handleDateChange}
				></CalendarEventFormComponent>

				<div className="button-container calendar-button-container">
					<button
						type="button"
						className="button-secondary"
						onClick={handleClose}
					>
						<i className="fas fa-times"></i>&nbsp;Cancel
					</button>
					<button
						type="button"
						className="button-delete"
						onClick={handleDelete}
					>
						<i className="fas fa-trash"></i>&nbsp;Delete
					</button>
					<button type="submit" className="button-primary">
						<i className="fas fa-save"></i>&nbsp;Save
					</button>
				</div>
			</form>
		</div>
	);
}
