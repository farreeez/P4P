import { useContext, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import CalendarEventFormComponent from "../../CalendarEventFormComponent/CalendarEventFormComponent.jsx";
import { Calendar } from "../../../../api/calendarApi.js";
import { useModal } from "../../../../hooks/useModal.js";
import { AppContext } from "../../../../contexts/AppContextProvider.jsx";

/**
 * Add calendar event component.
 */
export default function AddCalendarEventComponent({ onEventAdded }) {
	const { currentUser } = useContext(AppContext);
	const { closeModal } = useModal();
	const { createEvent } = Calendar.createAsync();

	const [formData, setFormData] = useState({
		eventName: "",
		eventDescription: "",
		eventDate: new Date(),
		startTime: new Date(),
		endTime: new Date(new Date().setHours(new Date().getHours() + 1)),
		category: "Work",
		isPrivate: true,
		userId: currentUser?.id,
	});

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
		setFormData({
			...formData,
			[name]: value,
		});
	}

	/**
	 * Create new event.
	 */
	async function handleSubmit(e) {
		e.preventDefault();

		/**
		 * Set start and end times based on the event date
		 * @param time
		 * @returns {Date}
		 */
		function updateTime(time) {
			const updatedTime = new Date(formData.eventDate);
			updatedTime.setHours(time.getHours(), time.getMinutes());
			return updatedTime;
		}

		const updatedFormData = {
			...formData,
			startTime: updateTime(formData.startTime),
			endTime: updateTime(formData.endTime),
		};

		// Persist the event data and refresh the events
		await createEvent(updatedFormData);
		onEventAdded();

		closeModal();
	}

	/**
	 * Close modal.
	 */
	function handleCancel() {
		closeModal();
	}

	return (
		<div>
			<div className="event-form-header">
				<h2>Add New Event</h2>
				<p>Create a new event in your calendar.</p>
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
						onClick={handleCancel}
					>
						<i className="fas fa-times"></i>&nbsp;Cancel
					</button>
					<button type="submit" className="button-primary">
						<i className="fas fa-plus"></i>&nbsp;Add Event
					</button>
				</div>
			</form>
		</div>
	);
}
