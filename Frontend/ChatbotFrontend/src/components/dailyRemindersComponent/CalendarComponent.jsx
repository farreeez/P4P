import { useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
// Remove drag and drop for now due to React 18 compatibility issues
// import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
// import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./CalendarComponent.css";
import { Calendar as CalendarApi } from "../../api/calendarApi.js";
import { useModal } from "../../hooks/useModal.js";
import EditCalendarEventComponent from "./Modals/CalendarEventComponent/EditCalendarEventComponent.jsx";

const localizer = momentLocalizer(moment);
// Use regular Calendar instead of DnDCalendar for React 18 compatibility
const CalendarWithEvents = Calendar;

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
	const [currentDate, setCurrentDate] = useState(new Date());
	const scrollTime = moment().subtract(1, "hours"); // Scroll to current time - 1hr

	/**
	 * Handle event resize updating the event's start and end times
	 * Note: Drag and drop temporarily disabled for React 18 compatibility
	 */
	function onEventResize(data) {
		if (readOnly) return;
		
		// This function is preserved for future use when drag-and-drop is re-enabled
		console.log('Event resize attempted:', data);
	}

	/**
	 * Handle event drop updating the event's start, end times, and eventDate
	 * Note: Drag and drop temporarily disabled for React 18 compatibility
	 */
	function onEventDrop(data) {
		if (readOnly) return;
		
		// This function is preserved for future use when drag-and-drop is re-enabled
		console.log('Event drop attempted:', data);
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
		let borderColor = "";

		switch (event.category) {
			case "Work":
				backgroundColor = "#0ea5e9";
				borderColor = "#0284c7";
				break;
			case "Personal":
				backgroundColor = "#ec4899";
				borderColor = "#db2777";
				break;
			case "Family":
				backgroundColor = "#10b981";
				borderColor = "#059669";
				break;
			case "Social":
				backgroundColor = "#8b5cf6";
				borderColor = "#7c3aed";
				break;
			default:
				backgroundColor = "#3b82f6";
				borderColor = "#2563eb";
		}

		return {
			style: {
				backgroundColor,
				borderColor,
				border: `2px solid ${borderColor}`,
				borderRadius: "8px",
				color: "white",
				fontWeight: "500",
			},
		};
	}

	/**
	 * Custom event wrapper to add category data attribute
	 */
	function EventWrapper({ event, children }) {
		return (
			<div data-category={event.category}>
				{children}
			</div>
		);
	}

	/**
	 * Custom toolbar messages
	 */
	const messages = {
		allDay: 'All Day',
		previous: '‹ Previous',
		next: 'Next ›',
		today: 'Today',
		month: 'Month',
		week: 'Week',
		day: 'Day',
		agenda: 'Agenda',
		date: 'Date',
		time: 'Time',
		event: 'Event',
		noEventsInRange: 'No events scheduled for this time period.',
		showMore: total => `+${total} more`,
	};

	/**
	 * Custom date header format
	 */
	const formats = {
		monthHeaderFormat: 'MMMM YYYY',
		dayHeaderFormat: 'dddd, MMMM Do',
		dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
			localizer.format(start, 'MMMM DD', culture) + ' – ' + 
			localizer.format(end, 'MMMM DD, YYYY', culture),
		agendaHeaderFormat: ({ start, end }, culture, localizer) =>
			localizer.format(start, 'MMMM DD', culture) + ' – ' + 
			localizer.format(end, 'MMMM DD, YYYY', culture),
	};

	return (
		<div className="calendar-app">
			<CalendarWithEvents
				localizer={localizer}
				events={events}
				date={currentDate}
				view={currentView}
				onView={onView}
				onNavigate={onNavigate}
				// Drag and drop temporarily disabled for React 18 compatibility
				// onEventDrop={readOnly ? null : onEventDrop}
				// onEventResize={readOnly ? null : onEventResize}
				onSelectEvent={readOnly ? null : handleSelectEvent}
				scrollToTime={scrollTime.toDate()}
				step={30}
				timeslots={1}
				eventPropGetter={customColors}
				components={{
					eventWrapper: EventWrapper,
				}}
				messages={messages}
				formats={formats}
				style={{ 
					height: "600px",
					fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"
				}}
				views={["month", "week", "day", "agenda"]}
				popup={true}
				popupOffset={30}
				showMultiDayTimes={true}
				startAccessor="start"
				endAccessor="end"
				titleAccessor="title"
				tooltipAccessor="eventDescription"
				allDayAccessor={() => false}
				// Remove dayLayoutAlgorithm for better compatibility
				selectable={!readOnly}
				resizable={false} // Disable resizing for now
			/>
		</div>
	);
}