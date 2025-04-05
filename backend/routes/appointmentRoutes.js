const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

const generateTimeSlots = () => {
  const slots = [];
  let time = new Date();
  time.setHours(10, 0, 0, 0);
  while (time.getHours() < 17) {
    if (time.getHours() !== 13) { // Skip 1 PM - 2 PM break
      slots.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
    time.setMinutes(time.getMinutes() + 30);
  }
  return slots;
};

// Get available slots
router.get('/slots/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const bookings = await Appointment.find({
      date: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lte: new Date(date.setHours(23, 59, 59, 999)),
      },
    });
    const allSlots = generateTimeSlots();
    const bookedSlots = bookings.map((b) => b.timeSlot);
    const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));
    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Book an appointment
router.post('/book', async (req, res) => {
  const { name, phone, date, timeSlot } = req.body;
  try {
    const existingBooking = await Appointment.findOne({
      date: new Date(date),
      timeSlot,
    });
    if (existingBooking) {
      return res.status(400).json({ error: 'This slot is already booked' });
    }
    const appointment = new Appointment({ name, phone, date: new Date(date), timeSlot });
    await appointment.save();
    res.status(201).json({ message: 'Appointment booked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;