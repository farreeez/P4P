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
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch and format calendar events for react-big-calendar
   */
  async function refreshEvents() {
    try {
      setIsLoading(true);
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
      console.error("Calendar events fetch error:", error);
    } finally {
      setIsLoading(false);
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
      <Header title="Daily Reminders" />
      
      <div className="calendar-content">
        <div className="dashboard-header">
          <div className="calendar-title-section">
            <h2 className="calendar-page-title">Your Schedule</h2>
            <p className="calendar-page-subtitle">
              Manage your appointments and reminders
            </p>
          </div>
          
          <div className="button-container">
            <button 
              className="action-button button-primary" 
              onClick={handleOpenCreateModal}
              aria-label="Add new calendar event"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="18"
                height="18"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Event
            </button>
            
            <button 
              className="action-button button-secondary" 
              onClick={handleOpenImportModal}
              aria-label="Import calendar events"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="18"
                height="18"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Import Events
            </button>
          </div>
        </div>

        <div className="calendar-wrapper">
          <div className="calendar-container">
            {isLoading ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '400px',
                color: 'var(--text-secondary)'
              }}>
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    width="32"
                    height="32"
                    style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }}
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <p>Loading your calendar...</p>
                </div>
              </div>
            ) : (
              <CalendarComponent
                events={events}
                setEvents={setEvents}
                onEventUpdated={refreshEvents}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}