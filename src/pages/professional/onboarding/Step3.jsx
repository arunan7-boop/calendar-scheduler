import React, { useState } from 'react';
import { COPY } from '../../../config/theme';
import './Step3.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DEFAULT_HOURS = { startTime: '09:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' };

export default function Step3({ data, onSave, onNext, onBack }) {
  const [workingHours, setWorkingHours] = useState(data || {
    Monday: { ...DEFAULT_HOURS, working: true, shareWithOrg: false },
    Tuesday: { ...DEFAULT_HOURS, working: true, shareWithOrg: false },
    Wednesday: { ...DEFAULT_HOURS, working: true, shareWithOrg: false },
    Thursday: { ...DEFAULT_HOURS, working: true, shareWithOrg: false },
    Friday: { ...DEFAULT_HOURS, working: true, shareWithOrg: false },
    Saturday: { ...DEFAULT_HOURS, working: false, shareWithOrg: false },
    Sunday: { ...DEFAULT_HOURS, working: false, shareWithOrg: false }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDayChange = (day, field, value) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    // Validate at least one working day
    const hasWorkingDay = Object.values(workingHours).some(day => day.working);
    if (!hasWorkingDay) {
      setError('Please set at least one working day');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSave(3, workingHours);
      onNext();
    } catch (err) {
      setError(err.message || 'Failed to save working hours');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="step-container step-3">
      <h2>{COPY.onboarding.step3.title}</h2>
      <p className="step-description">{COPY.onboarding.step3.description}</p>

      <div className="working-hours-container">
        {DAYS.map(day => (
          <div key={day} className="day-row">
            <div className="day-header">
              <label className="working-checkbox">
                <input
                  type="checkbox"
                  checked={workingHours[day].working}
                  onChange={(e) => handleDayChange(day, 'working', e.target.checked)}
                />
                <span>{day}</span>
              </label>
            </div>

            {workingHours[day].working && (
              <div className="day-times">
                <div className="time-field">
                  <label>{COPY.onboarding.step3.startTime}</label>
                  <input
                    type="time"
                    value={workingHours[day].startTime}
                    onChange={(e) => handleDayChange(day, 'startTime', e.target.value)}
                  />
                </div>

                <div className="time-field">
                  <label>{COPY.onboarding.step3.endTime}</label>
                  <input
                    type="time"
                    value={workingHours[day].endTime}
                    onChange={(e) => handleDayChange(day, 'endTime', e.target.value)}
                  />
                </div>

                <div className="time-field">
                  <label>{COPY.onboarding.step3.breakTime}</label>
                  <div className="break-times">
                    <input
                      type="time"
                      value={workingHours[day].breakStart}
                      onChange={(e) => handleDayChange(day, 'breakStart', e.target.value)}
                      placeholder="Break start"
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={workingHours[day].breakEnd}
                      onChange={(e) => handleDayChange(day, 'breakEnd', e.target.value)}
                      placeholder="Break end"
                    />
                  </div>
                </div>

                <label className="share-checkbox">
                  <input
                    type="checkbox"
                    checked={workingHours[day].shareWithOrg || false}
                    onChange={(e) => handleDayChange(day, 'shareWithOrg', e.target.checked)}
                  />
                  <span>{COPY.onboarding.step3.share}</span>
                </label>
              </div>
            )}

            {!workingHours[day].working && (
              <div className="not-working">
                {COPY.onboarding.step3.notWorking}
              </div>
            )}
          </div>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onBack}
        >
          {COPY.buttons.back}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : COPY.buttons.save}
        </button>
      </div>
    </div>
  );
}
