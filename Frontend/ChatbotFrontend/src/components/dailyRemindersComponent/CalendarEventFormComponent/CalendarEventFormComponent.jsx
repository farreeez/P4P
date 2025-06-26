import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./CalendarEventFormComponent.css";

/**
 * Reusable Calendar Event Form with modern styling
 */
export default function CalendarEventFormComponent({
	formData,
	handleInputChange,
	handleDateChange,
}) {
	return (
		<>
			<div className="form-group">
				<label htmlFor="eventName">Event Name</label>
				<input
					type="text"
					id="eventName"
					name="eventName"
					placeholder="Enter a descriptive name for your event"
					value={formData.eventName}
					onChange={handleInputChange}
					required
				/>
			</div>

			<div className="form-group">
				<label htmlFor="eventDescription">Description</label>
				<textarea
					id="eventDescription"
					name="eventDescription"
					placeholder="Add any additional details or notes about this event"
					value={formData.eventDescription}
					onChange={handleInputChange}
					required
				/>
			</div>

			<div className="form-group">
				<label htmlFor="eventDate">Date</label>
				<div className="date-picker-container">
					<DatePicker
						selected={formData.eventDate}
						onChange={date => handleDateChange("eventDate", date)}
						dateFormat="MMMM d, yyyy"
						className="date-input"
						id="eventDate"
						placeholderText="Select event date"
						minDate={new Date()}
						showPopperArrow={false}
					/>
					<span className="calendar-icon">
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
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
							<line x1="16" y1="2" x2="16" y2="6"></line>
							<line x1="8" y1="2" x2="8" y2="6"></line>
							<line x1="3" y1="10" x2="21" y2="10"></line>
						</svg>
					</span>
				</div>
			</div>

			<div className="time-group">
				<div className="form-group time-input">
					<label htmlFor="startTime">Start Time</label>
					<div className="time-picker-container">
						<DatePicker
							selected={formData.startTime}
							onChange={time =>
								handleDateChange("startTime", time)
							}
							showTimeSelect
							showTimeSelectOnly
							timeIntervals={15}
							timeCaption="Start Time"
							dateFormat="h:mm aa"
							className="time-input"
							id="startTime"
							placeholderText="Select start time"
							showPopperArrow={false}
						/>
						<span className="time-icon">
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
								<circle cx="12" cy="12" r="10"></circle>
								<polyline points="12,6 12,12 16,14"></polyline>
							</svg>
						</span>
					</div>
				</div>

				<div className="form-group time-input">
					<label htmlFor="endTime">End Time</label>
					<div className="time-picker-container">
						<DatePicker
							selected={formData.endTime}
							onChange={time => handleDateChange("endTime", time)}
							showTimeSelect
							showTimeSelectOnly
							timeIntervals={15}
							timeCaption="End Time"
							dateFormat="h:mm aa"
							className="time-input"
							id="endTime"
							placeholderText="Select end time"
							showPopperArrow={false}
							minTime={formData.startTime}
							maxTime={new Date().setHours(23, 59, 59, 999)}
						/>
						<span className="time-icon">
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
								<circle cx="12" cy="12" r="10"></circle>
								<polyline points="12,6 12,12 16,14"></polyline>
							</svg>
						</span>
					</div>
				</div>
			</div>

			<div className="form-group">
				<label htmlFor="category">Category</label>
				<div className="select-container">
					<select
						id="category"
						name="category"
						value={formData.category}
						onChange={handleInputChange}
						className="category-select"
					>
						<option value="Work">🏢 Work</option>
						<option value="Personal">🏠 Personal</option>
						<option value="Family">👨‍👩‍👧‍👦 Family</option>
						<option value="Social">🎉 Social</option>
						<option value="Health">🏥 Health</option>
						<option value="Other">📌 Other</option>
					</select>
				</div>
			</div>

			<div className="form-group checkbox-group">
				<div 
					className="toggle-group"
					onClick={() =>
						handleInputChange({
							target: {
								name: "isPrivate",
								value: !formData.isPrivate,
							},
						})
					}
				>
					<div className={`toggle ${formData.isPrivate ? "" : "active"}`}>
						<div className="toggle-slider" />
					</div>
					<span>
						{formData.isPrivate ? "🔒 Private Event" : "👥 Shared Event"}
					</span>
				</div>
			</div>
		</>
	);
}