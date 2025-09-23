import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const FraudTrendChart = ({ data = [], title = 'Fraud Risk Trends' }) => {
  const chartData = {
    labels: data.map(
      (item) => item.time || `Transaction ${data.indexOf(item) + 1}`
    ),
    datasets: [
      {
        label: 'Risk Score',
        data: data.map((item) => (item.riskScore || item.y || 0) * 100), // Convert to percentage
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: data.map((item) => {
          const riskScore = item.riskScore || item.y || 0;
          if (riskScore >= 0.7) return 'rgb(220, 38, 38)'; // High risk - red
          if (riskScore >= 0.4) return 'rgb(245, 158, 11)'; // Medium risk - yellow
          if (riskScore >= 0.2) return 'rgb(59, 130, 246)'; // Low risk - blue
          return 'rgb(34, 197, 94)'; // Safe - green
        }),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          font: {
            size: 12,
            family: 'Inter, sans-serif',
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
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const value = context.parsed.y;
            const classification =
              data[context.dataIndex]?.classification || 'Unknown';
            return [
              `Risk Score: ${value.toFixed(1)}%`,
              `Classification: ${classification}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Transaction Sequence',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          maxTicksLimit: 10,
          font: {
            size: 11,
          },
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Risk Score (%)',
          font: {
            size: 12,
            weight: 'bold',
          },
        },
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function (value) {
            return value + '%';
          },
          font: {
            size: 11,
          },
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default FraudTrendChart;
