const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

// Generate time slots from 10:00 AM to 5:00 PM, excluding 1:00 PM - 2:00 PM break
const generateTimeSlots = () => {
  const slots = [];
  const startTime = new Date();
  startTime.setHours(10, 0, 0, 0); // Start at 10:00 AMa

  while (startTime.getHours() < 17) { // Up to 5:00 PM
    const hour = startTime.getHours();
    if (hour !== 13) { // Skip 1:00 PM - 2:00 PM break
      slots.push(
        startTime.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true 
        })
      );
    }
    startTime.setMinutes(startTime.getMinutes() + 30); // Increment by 30 minutes
  }
  return slots;
};

// GET: Fetch available slots for a specific date
router.get('/slots/:date', async (req, res) => {
  try {
    const selectedDate = new Date(req.params.date);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    const bookings = await Appointment.find({
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const allSlots = generateTimeSlots();
    const bookedSlots = bookings.map((booking) => booking.timeSlot);
    const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

    res.status(200).json(availableSlots);
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ error: 'Server error while fetching slots' });
  }
});

// POST: Book an appointment
router.post('/book', async (req, res) => {
  const { name, phone, date, timeSlot } = req.body;

  // Input validation
  if (!name || !phone || !date || !timeSlot) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Check for existing booking
    const existingBooking = await Appointment.findOne({
      date: appointmentDate,
      timeSlot,
    });

    if (existingBooking) {
      return res.status(400).json({ error: 'This slot is already booked' });
    }



    const newAppointment = new Appointment({
      name,
      phone,
      date: appointmentDate,
      timeSlot,
    });
    console.log(newAppointment)

    await newAppointment.save();
    res.status(201).json({ message: 'Appointment booked successfully' });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'Server error while booking appointment' });
  }
});

module.exports = router;