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
//   const { getCalendarEvents } = CalendarApi.getAsync();
  const [events, setEvents] = useState([]);

  /**
   * Fetch and format calendar events for react-big-calendar
   */
  async function refreshEvents() {
    try {
      const fetchedEvents = await getCalendarEvents();

      const formattedEvents = fetchedEvents.map((event) => ({
        id: event._id,
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
    // refreshEvents();
    const testEvents = [
      {
        category: "Work",
        end: new Date("2025-06-06T12:30:00+12:00"),
        eventDate: "2025-06-06T00:30:00.000Z",
        eventDescription: "Test event 1",
        id: "68422efef822b38ba18ab840",
        isPrivate: false,
        start: new Date("2025-06-06T11:30:00+12:00"),
        title: "Event 1",
      },
      {
        category: "Personal",
        end: new Date("2025-06-07T15:00:00+12:00"),
        eventDate: "2025-06-07T03:00:00.000Z",
        eventDescription: "Test event 2",
        id: "68422efef822b38ba18ab841",
        isPrivate: true,
        start: new Date("2025-06-07T14:00:00+12:00"),
        title: "Event 2",
      },
      {
        category: "Work",
        end: new Date("2025-06-08T17:00:00+12:00"),
        eventDate: "2025-06-08T05:00:00.000Z",
        eventDescription: "Test event 3",
        id: "68422efef822b38ba18ab842",
        isPrivate: false,
        start: new Date("2025-06-08T16:00:00+12:00"),
        title: "Event 3",
      },
      {
        category: "Social",
        end: new Date("2025-06-09T20:00:00+12:00"),
        eventDate: "2025-06-09T08:00:00.000Z",
        eventDescription: "Test event 4",
        id: "68422efef822b38ba18ab843",
        isPrivate: true,
        start: new Date("2025-06-09T18:00:00+12:00"),
        title: "Event 4",
      },
      {
        category: "Health",
        end: new Date("2025-06-10T10:30:00+12:00"),
        eventDate: "2025-06-10T22:30:00.000Z",
        eventDescription: "Test event 5",
        id: "68422efef822b38ba18ab844",
        isPrivate: false,
        start: new Date("2025-06-10T09:30:00+12:00"),
        title: "Event 5",
      },
    ];

    setEvents(testEvents);
  }, []);

  /**
   * Open calendar import modal
   */
  function handleOpenImportModal() {
	console.log("here")
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
