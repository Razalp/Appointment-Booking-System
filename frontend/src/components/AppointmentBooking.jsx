"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Calendar, Clock, User, Phone } from "lucide-react"
import '../css/styles.css';
export default function AppointmentBooking() {
  const [date, setDate] = useState("")
  const [slots, setSlots] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    timeSlot: "",
  })
  const [message, setMessage] = useState("")
  const [bookedInfo, setBookedInfo] = useState(null)

  // Fetch available slots for the selected date
  const fetchSlots = async () => {
    if (!date) {
      setSlots([])
      return
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/slots/${date}`)
      setSlots(response.data)
    } catch (error) {
      console.error("Error fetching available slots:", error)
      setMessage("Failed to load available slots. Please try again.")
      setSlots([])
    }
  }

  // Fetch slots whenever the date changes
  useEffect(() => {
    fetchSlots()
  }, [date])

  // Handle form submission to book an appointment
  const handleSubmit = async (e) => {
    e.preventDefault()
    const { name, phone, timeSlot } = formData

    if (!name || !phone || !timeSlot) {
      setMessage("Please fill in all fields.")
      return
    }

    try {
      const response = await axios.post("http://localhost:5000/api/book", {
        name,
        phone,
        date,
        timeSlot,
      })

      setMessage(response.data.message)
      setBookedInfo({ name, timeSlot, date })
      setFormData({ name: "", phone: "", timeSlot: "" })
      fetchSlots()
    } catch (error) {
      setMessage(error.response?.data?.error || "Error booking appointment.")
    }
  }

  return (
    <div className="appointment-container">
      <div className="appointment-card">
        {bookedInfo && (
          <div className="booked-info">
            <p>
              Appointment booked for <strong>{bookedInfo.name}</strong> on{" "}
              {new Date(bookedInfo.date).toLocaleDateString()} at <strong>{bookedInfo.timeSlot}</strong>
            </p>
          </div>
        )}
        <h2 className="appointment-title">Book an Appointment</h2>
        <form onSubmit={handleSubmit} className="appointment-form">
          <div className="form-group">
            <label htmlFor="date" className="form-label">
              <Calendar className="icon" size={18} />
              <span>Select Date</span>
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="form-input"
            />
          </div>

          {slots.length > 0 ? (
            <div className="form-group">
              <label htmlFor="timeSlot" className="form-label">
                <Clock className="icon" size={18} />
                <span>Select Time</span>
              </label>
              <select
                id="timeSlot"
                value={formData.timeSlot}
                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                required
                className="form-input"
              >
                <option value="">Select a time slot</option>
                {slots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            date && <p className="no-slots">No available slots for this date.</p>
          )}

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              <User className="icon" size={18} />
              <span>Your Name</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              <Phone className="icon" size={18} />
              <span>Phone Number</span>
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="form-input"
            />
          </div>

          <button type="submit" className="submit-button">
            Book Appointment
          </button>

          {message && <p className="message">{message}</p>}
        </form>
      </div>
    </div>
  )
}

