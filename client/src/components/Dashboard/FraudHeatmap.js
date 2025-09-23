import React from 'react';

const FraudHeatmap = ({
  data = [],
  title = 'Fraud Activity Heatmap (24 Hours)',
}) => {
  // Create 24-hour heatmap data with safe defaults
  const safeData =
    data.length > 0
      ? data
      : Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }));
  const maxValue = Math.max(...safeData.map((item) => item.count), 1);

  const getIntensityColor = (value) => {
    const intensity = value / maxValue;
    if (intensity === 0) return 'rgba(229, 231, 235, 1)'; // Gray for no activity
    if (intensity <= 0.2) return 'rgba(34, 197, 94, 0.3)'; // Light green
    if (intensity <= 0.4) return 'rgba(59, 130, 246, 0.5)'; // Light blue
    if (intensity <= 0.6) return 'rgba(245, 158, 11, 0.6)'; // Orange
    if (intensity <= 0.8) return 'rgba(239, 68, 68, 0.7)'; // Red
    return 'rgba(220, 38, 38, 0.9)'; // Dark red
  };

  const getTextColor = (value) => {
    const intensity = value / maxValue;
    return intensity > 0.5 ? '#fff' : '#1f2937';
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const formatHour = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h3
        style={{
          margin: '0 0 20px 0',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#1f2937',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {title}
      </h3>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px',
          fontSize: '12px',
          color: '#6b7280',
        }}
      >
        <span style={{ marginRight: '10px' }}>Low Activity</span>
        <div style={{ display: 'flex', marginRight: '10px' }}>
          {[0.1, 0.3, 0.5, 0.7, 0.9].map((intensity, index) => (
            <div
              key={index}
              style={{
                width: '20px',
                height: '12px',
                backgroundColor: getIntensityColor(intensity * maxValue),
                border: '1px solid #e5e7eb',
                marginRight: '2px',
              }}
            />
          ))}
        </div>
        <span>High Activity</span>
      </div>

      {/* Heatmap Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '4px',
          maxWidth: '600px',
        }}
      >
        {hours.map((hour) => {
          const hourData = safeData.find((item) => item.hour === hour) || {
            hour,
            count: 0,
          };
          const value = hourData.count;

          return (
            <div
              key={hour}
              style={{
                backgroundColor: getIntensityColor(value),
                color: getTextColor(value),
                padding: '12px 8px',
                borderRadius: '6px',
                textAlign: 'center',
                fontSize: '11px',
                fontWeight: '500',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'Inter, sans-serif',
                position: 'relative',
              }}
              title={`${formatHour(hour)}: ${value} fraud alerts`}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.zIndex = '10';
                e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.zIndex = '1';
                e.target.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                {hour === 0
                  ? '12a'
                  : hour <= 12
                  ? `${hour}${hour === 12 ? 'p' : 'a'}`
                  : `${hour - 12}p`}
              </div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>{value}</div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f9fafb',
          borderRadius: '6px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '15px',
          fontSize: '12px',
        }}
      >
        <div>
          <div style={{ fontWeight: 'bold', color: '#1f2937' }}>Peak Hour</div>
          <div style={{ color: '#6b7280' }}>
            {(() => {
              const peakHour = safeData.reduce(
                (max, item) => (item.count > max.count ? item : max),
                { hour: 0, count: 0 }
              );
              return formatHour(peakHour.hour);
            })()}
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 'bold', color: '#1f2937' }}>
            Total Alerts
          </div>
          <div style={{ color: '#6b7280' }}>
            {safeData.reduce((sum, item) => sum + item.count, 0)}
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 'bold', color: '#1f2937' }}>
            Active Hours
          </div>
          <div style={{ color: '#6b7280' }}>
            {safeData.filter((item) => item.count > 0).length}/24
          </div>
        </div>
      </div>
    </div>
  );
};

export default FraudHeatmap;
