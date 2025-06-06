import { useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./CalendarComponent.css";
import { Calendar as CalendarApi } from "../../api/calendarApi.js";
import { useModal } from "../../hooks/useModal.js";
import EditCalendarEventComponent from "./Modals/CalendarEventComponent/EditCalendarEventComponent.jsx";

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

/**
 * Calendar component using react-big-calendar libraries
 */
export default function CalendarComponent({
	events,
	setEvents,
	onEventUpdated,
	readOnly = false,
}) {
	// Hooks
	const { updateEvent } = CalendarApi.updateAsync();
	const { openModal } = useModal();

	// Calendar state
	const [currentView, setCurrentView] = useState(Views.MONTH);
	const [currentDate, setCurrentDate] = useState(moment);
	const scrollTime = moment().subtract(1, "hours"); // Scroll to current time - 1hr

	/**
	 * Handle event resize updating the event's start and end times
	 */
	function onEventResize(data) {
		if (readOnly) return;

		const { event, start, end } = data;

		// Also shift event date
		const eventDate = new Date(start);

		setEvents(prevEvents =>
			prevEvents.map(existingEvent =>
				existingEvent.id === event.id
					? { ...existingEvent, start, end, eventDate }
					: existingEvent,
			),
		);
		updateEvent(event.id, {
			startTime: start,
			endTime: end,
			eventDate: eventDate,
		});
	}

	/**
	 * Handle event drop updating the event's start, end times, and eventDate
	 */
	function onEventDrop(data) {
		if (readOnly) return;

		const { event, start, end } = data;

		// Also shift event date
		const eventDate = new Date(start);

		setEvents(prevEvents =>
			prevEvents.map(existingEvent =>
				existingEvent.id === event.id
					? { ...existingEvent, start, end, eventDate }
					: existingEvent,
			),
		);

		// Update database
		updateEvent(event.id, {
			startTime: start,
			endTime: end,
			eventDate: eventDate,
		});
	}

	/**
	 * Handle view changes
	 */
	function onView(newView) {
		setCurrentView(newView);
	}

	/**
	 * Handle date changes
	 */
	function onNavigate(newDate) {
		setCurrentDate(newDate);
	}

	/**
	 * Open modal to edit event
	 */
	function handleSelectEvent(event) {
		if (readOnly) return;
		openModal(
			<EditCalendarEventComponent
				event={event}
				onEventUpdated={onEventUpdated}
			/>,
		);
	}

	/**
	 * Render different colors for events based on category
	 * @param event
	 */
	function customColors(event) {
		let backgroundColor = "";

		switch (event.category) {
			case "Work":
				backgroundColor = "#039BE5";
				break;
			case "Personal":
				backgroundColor = "#E91E63";
				break;
			case "Family":
				backgroundColor = "#009688";
				break;
			case "Social":
				backgroundColor = "#9B51E0";
				break;
			default:
				backgroundColor = "#4b46c2";
		}

		return {
			style: {
				backgroundColor,
			},
		};
	}

	return (
		<div className="App">
			<DnDCalendar
				localizer={localizer}
				events={events}
				date={currentDate}
				view={currentView}
				onView={onView}
				onNavigate={onNavigate}
				onEventDrop={readOnly ? null : onEventDrop}
				onEventResize={readOnly ? null : onEventResize}
				onSelectEvent={readOnly ? null : handleSelectEvent}
				scrollToTime={scrollTime.toDate()}
				step={30}
				timeslots={1}
				eventPropGetter={customColors}
				style={{ height: "600px" }}
				views={["month", "week", "day"]}
			/>
		</div>
	);
}
