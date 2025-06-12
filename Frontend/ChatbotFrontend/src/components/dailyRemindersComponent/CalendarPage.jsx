import { useContext, useEffect, useState } from "react";
import { ModalContext } from "../../contexts/ModalContextProvider.jsx";
import { Calendar as CalendarApi } from "../../api/calendarApi.js";
import ImportCalendarComponent from "./Modals/ImportCalendarComponent/ImportCalendarComponent.jsx";
import AddCalendarEventComponent from "./Modals/CalendarEventComponent/AddCalendarEventComponent.jsx";
import CalendarComponent from "./CalendarComponent.jsx";
import { toast } from "react-toastify";
import "./CalendarPage.css";
import Header from "../shared/Header.jsx";

/**
 * Calendar page component
 * @returns {JSX.Element}
 * @constructor
 */
export default function CalendarPage() {
  const { openModal } = useContext(ModalContext);
  const { getCalendarEvents } = CalendarApi.getAsync();
  const [events, setEvents] = useState([]);

  /**
   * Fetch and format calendar events for react-big-calendar
   */
  async function refreshEvents() {
    try {
      const fetchedEvents = await getCalendarEvents();

      const formattedEvents = fetchedEvents.map((event) => ({
        id: event.id,
        title: event.eventName, // Must be named this for react-big-calendar
        eventDescription: event.eventDescription,
        eventDate: event.eventDate,
        start: new Date(event.startTime), // Must be named this for react-big-calendar
        end: new Date(event.endTime), // Must be named this for react-big-calendar
        category: event.category,
        isPrivate: event.isPrivate,
      }));

      setEvents(formattedEvents);
    } catch (error) {
      toast.error("Error fetching events");
    }
  }

  useEffect(() => {
    refreshEvents();
  }, []);

  /**
   * Open calendar import modal
   */
  function handleOpenImportModal() {
    openModal(<ImportCalendarComponent onEventsImported={refreshEvents} />);
  }

  /**
   * Open calendar event creation modal
   */
  function handleOpenCreateModal() {
    openModal(<AddCalendarEventComponent onEventAdded={refreshEvents} />);
  }

  return (
    <div className="calendar-page-container">
      <Header title={"Reminders"} />
      <div className="dashboard-header">
        <div className="button-container">
          <button className="button-primary" onClick={handleOpenCreateModal}>
            <i className="fas fa-plus"></i>&nbsp;Add Event
          </button>
          <button className="button-secondary" onClick={handleOpenImportModal}>
            <i className="fas fa-upload"></i>&nbsp;Import Events
          </button>
        </div>
      </div>

      <div>
        <CalendarComponent
          events={events}
          setEvents={setEvents}
          onEventUpdated={refreshEvents}
        />
      </div>
    </div>
  );
}
