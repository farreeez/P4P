import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./CalendarEventFormComponent.css";

/**
 * Reusable Calendar Event Form
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
					placeholder="Enter event name"
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
					placeholder="Enter event description"
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
					/>
					<span className="calendar-icon">
						<i className="fas fa-calendar"></i>
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
							timeCaption="Time"
							dateFormat="h:mm aa"
							className="time-input"
							id="startTime"
						/>
						<span className="time-icon">
							<i className="fas fa-clock"></i>
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
							timeCaption="Time"
							dateFormat="h:mm aa"
							className="time-input"
							id="endTime"
						/>
						<span className="time-icon">
							<i className="fas fa-clock"></i>
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
						<option value="Work">Work</option>
						<option value="Personal">Personal</option>
						<option value="Family">Family</option>
						<option value="Social">Social</option>
						<option value="Other">Other</option>
					</select>
				</div>
			</div>

			<div className="form-group checkbox-group">
				<div className="toggle-group">
					<div
						className={`toggle ${formData.isPrivate ? "" : "active"}`}
						onClick={() =>
							handleInputChange({
								target: {
									name: "isPrivate",
									value: !formData.isPrivate,
								},
							})
						}
					>
						<div className="toggle-slider" />
					</div>
					<span>Share with friends</span>
				</div>
			</div>
		</>
	);
}
