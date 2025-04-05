import { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/styles.css';

const AppointmentBooking = () => {
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    timeSlot: '',
  });
  const [message, setMessage] = useState('');
  const [bookedInfo, setBookedInfo] = useState(null); // New state to store booked details

  // Fetch available slots for the selected date
  const fetchSlots = async () => {
    if (!date) {
      setSlots([]);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/slots/${date}`);
      setSlots(response.data);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setMessage('Failed to load available slots. Please try again.');
      setSlots([]);
    }
  };

  // Fetch slots whenever the date changes
  useEffect(() => {
    fetchSlots();
  }, [date]);

  // Handle form submission to book an appointment
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, phone, timeSlot } = formData;

    if (!name || !phone || !timeSlot) {
      setMessage('Please fill in all fields.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/book', {
        name,
        phone,
        date,
        timeSlot,
      });

      setMessage(response.data.message);
      setBookedInfo({ name, timeSlot, date }); // Store booked details
      setFormData({ name: '', phone: '', timeSlot: '' }); // Reset form
      fetchSlots(); // Refresh available slots
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error booking appointment.');
    }
  };

  return (
    <div className="appointment-container">
      {/* Display booked information at the top if available */}
      {bookedInfo && (
        <div className="booked-info">
          <p>
            Appointment booked for <strong>{bookedInfo.name}</strong> on{' '}
            {new Date(bookedInfo.date).toLocaleDateString()} at{' '}
            <strong>{bookedInfo.timeSlot}</strong>
          </p>
        </div>
      )}
      <h2>Book an Appointment</h2>
      <form onSubmit={handleSubmit} className="appointment-form">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        {slots.length > 0 ? (
          <select
            value={formData.timeSlot}
            onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
            required
          >
            <option value="">Select a time slot</option>
            {slots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        ) : (
          <p>No available slots for this date.</p>
        )}
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
        <button type="submit">Book Appointment</button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
};

export default AppointmentBooking;