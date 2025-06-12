import { AppContext } from "../contexts/AppContextProvider.jsx";
import { useContext } from "react";
import getAsync from "../hooks/getAsync.js";
import updateAsync from "../hooks/updateAsync.js";
import deleteAsync from "../hooks/deleteAsync.js";
import createAsync from "../hooks/createAsync.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const API_CALENDAR_URL = `${API_BASE_URL}/api/calendar`;

/**
 * Calendar API class.
 */
export class Calendar {
	/**
	 * Gets all calendar events.
	 */
	static getAsync() {
		const { currentUser } = useContext(AppContext);
		const userId = currentUser?.id;

		const { data, isLoading, isError, fetch } = getAsync();

		/**
		 * Gets all calendar events.
		 */
		async function getCalendarEvents() {
			const events = await fetch(`${API_CALENDAR_URL}/user/${userId}`);
			return events ?? [];
		}

		return { getCalendarEvents, data, isLoading, isError };
	}

	/**
	 * Gets all unfinished calendar events.
	 */
	static getOngoingAsync() {
		const { currentUser } = useContext(AppContext);
		const userId = currentUser?.id;

		const { data, isLoading, isError, fetch } = getAsync();

		/**
		 * Gets all unfinished calendar events.
		 */
		async function getOngoingCalendarEvents() {
			const events = await fetch(
				`${API_CALENDAR_URL}/unfinishedEvents/${userId}`,
			);
			return events ?? [];
		}

		return { getOngoingCalendarEvents, data, isLoading, isError };
	}

	/**
	 * Creates a new calendar event.
	 */
	static createAsync() {
		const { data, isLoading, isError, post } = createAsync();

		/**
		 * Creates a new calendar event.
		 */
		async function createEvent(event) {
			const createdEvent = await post(API_CALENDAR_URL, event);
			return createdEvent?.id ?? "";
		}

		return { createEvent, isLoading, isError, data };
	}

	/**
	 * Updates a calendar event by ID.
	 */
	static updateAsync() {
		const { data, isLoading, isError, put } = updateAsync();

		/**
		 * Updates an event with the given ID and data.
		 */
		async function updateEvent(eventId, eventData) {
			await put(`${API_CALENDAR_URL}/${eventId}`, eventData);
		}

		return { updateEvent, data, isLoading, isError };
	}

	/**
	 * Deletes a calendar event by ID.
	 */
	static deleteAsync() {
		const { data, isLoading, isError, remove } = deleteAsync();

		/**
		 * Sets the ID and triggers the remove.
		 */
		async function deleteEvent(eventId) {
			await remove(`${API_CALENDAR_URL}/${eventId}`);
		}

		return { deleteEvent, data, isLoading, isError };
	}
}
