import React from 'react';
import ReactDOM from 'react-dom/client';
import AppointmentBooking from '../components/AppointmentBooking';
import '../css/styles.css';

class AppointmentBookingElement extends HTMLElement {
  connectedCallback() {
    const mountPoint = document.createElement('div');
    this.appendChild(mountPoint);
    ReactDOM.createRoot(mountPoint).render(<AppointmentBooking />);
  }
}

customElements.define('appointment-booking', AppointmentBookingElement);