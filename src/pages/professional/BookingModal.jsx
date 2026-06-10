import React, { useState } from 'react';
import './BookingModal.css';

export default function BookingModal({ onClose, services }) {
  const [selectedServices, setSelectedServices] = useState({});
  const [preferredDates, setPreferredDates] = useState(['', '']);

  const handleServiceToggle = (serviceId) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  const handleDateChange = (index, date) => {
    const newDates = [...preferredDates];
    newDates[index] = date;
    setPreferredDates(newDates);
  };

  const handleFindTimes = () => {
    const selected = Object.entries(selectedServices)
      .filter(([_, checked]) => checked)
      .map(([serviceId]) => serviceId);
    
    console.log('Selected services:', selected);
    console.log('Preferred dates:', preferredDates);
    // Trigger scheduling logic
  };

  return (
    <div className="booking-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="booking-modal">
        <div className="booking-header">
          <h2>Book Services</h2>
          <p>Select multiple services and your preferred times</p>
        </div>

        <div className="booking-instructions">
          <p>✨ Choose as many services as you'd like. We'll find the best available times for you.</p>
        </div>

        <div className="booking-services-section">
          <p className="section-label">Available Services</p>

          {services && services.map((serviceGroup) => (
            <div key={serviceGroup.id} className={`service-card ${selectedServices[serviceGroup.id] ? 'selected' : ''}`}>
              <div className="service-header">
                <div>
                  <h3>{serviceGroup.name}</h3>
                  <p>{serviceGroup.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={selectedServices[serviceGroup.id] || false}
                  onChange={() => handleServiceToggle(serviceGroup.id)}
                />
              </div>

              <div className="variants-chips">
                {serviceGroup.variants && serviceGroup.variants.map((variant) => (
                  <div key={variant.id} className={`variant-chip ${selectedServices[serviceGroup.id] ? 'selected' : ''}`}>
                    {variant.name} • £{variant.price} • {variant.duration_minutes} mins
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="booking-dates-section">
          <p className="section-label">Preferred Times</p>
          <div className="date-inputs">
            <input
              type="date"
              value={preferredDates[0]}
              onChange={(e) => handleDateChange(0, e.target.value)}
            />
            <input
              type="date"
              value={preferredDates[1]}
              onChange={(e) => handleDateChange(1, e.target.value)}
            />
          </div>
          <p className="date-helper">Select 1-2 dates. We'll find perfect times for you.</p>
        </div>

        <button className="booking-button" onClick={handleFindTimes}>
          Find Available Times
        </button>
      </div>
    </div>
  );
}
