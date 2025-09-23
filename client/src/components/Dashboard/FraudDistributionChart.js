import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const FraudDistributionChart = ({
  data = {},
  title = 'Fraud Risk Distribution',
}) => {
  // Ensure we have safe data with defaults
  const safeData = {
    Safe: 0,
    'Low Risk': 0,
    'Medium Risk': 0,
    'High Risk': 0,
    ...data,
  };

  const chartData = {
    labels: Object.keys(safeData),
    datasets: [
      {
        label: 'Transactions',
        data: Object.values(safeData),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)', // Safe - green
          'rgba(59, 130, 246, 0.8)', // Low Risk - blue
          'rgba(245, 158, 11, 0.8)', // Medium Risk - yellow
          'rgba(239, 68, 68, 0.8)', // High Risk - red
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
        hoverOffset: 4,
        hoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          font: {
            size: 12,
            family: 'Inter, sans-serif',
          },
          padding: 20,
          generateLabels: function (chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const total = dataset.data.reduce((sum, val) => sum + val, 0);
                const percentage =
                  total > 0 ? ((value / total) * 100).toFixed(1) : 0;

                return {
                  text: `${label}: ${value} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor[i],
                  lineWidth: dataset.borderWidth,
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
          family: 'Inter, sans-serif',
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce(
              (sum, val) => sum + val,
              0
            );
            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} transactions (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
    },
    elements: {
      arc: {
        borderJoinStyle: 'round',
      },
    },
  };

  const totalTransactions = Object.values(safeData).reduce(
    (sum, val) => sum + val,
    0
  );

  return (
    <div style={{ height: '350px', width: '100%', position: 'relative' }}>
      <Pie data={chartData} options={options} />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          fontFamily: 'Inter, sans-serif',
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '8px',
          padding: '8px 12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
          {totalTransactions}
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          Total Transactions
        </div>
      </div>
    </div>
  );
};

export default FraudDistributionChart;
