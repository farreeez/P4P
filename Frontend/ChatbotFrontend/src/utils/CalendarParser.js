import ICAL from "ical.js";

/**
 * Custom function to parse ICS files and extract events with NZ timezone conversion.
 */
export default async function CalendarParser(file, id) {
	// Read file contents and parse
	const text = await file.text();
	const jsonData = ICAL.parse(text);
	const comp = new ICAL.Component(jsonData);

	// Extract events and create objects for API
	const events = comp.getAllSubcomponents("vevent").map(vevent => {
		const event = new ICAL.Event(vevent);

		// Convert start and end dates to NZ time
		const startDate = event.startDate
			? convertToNZT(event.startDate.toJSDate())
			: convertToNZT(new Date());

		const endDate = event.endDate
			? convertToNZT(event.endDate.toJSDate())
			: convertToNZT(
					new Date(new Date().setHours(new Date().getHours() + 1)),
				);

		// Set eventDate to midnight on the start day in NZ time
		const eventDate = new Date(startDate);
		eventDate.setHours(0, 0, 0, 0);

		return {
			eventName: event.summary || "N/A",
			eventDescription: event.description || "N/A",
			eventDate: eventDate.toISOString(),
			startTime: startDate.toISOString(),
			endTime: endDate.toISOString(),
			category: "Other",
			isPrivate: false,
			userId: id,
		};
	});

	return events;
}

/**
 * Converts a date to New Zealand Time
 */
function convertToNZT(date) {
	const nzDate = new Date(date);

	// Check if daylight saving is active in NZ
	const month = nzDate.getMonth();
	const isDST = month > 8 || month < 3;
	const offsetHours = isDST ? 13 : 12;

	// Get current offset in hours
	const currentOffset = nzDate.getTimezoneOffset() / -60;

	// Calculate the difference needed to adjust to NZ time
	const adjustmentHours = offsetHours - currentOffset;

	// Apply the adjustment
	nzDate.setHours(nzDate.getHours() + adjustmentHours);

	return nzDate;
}
