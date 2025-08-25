import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type TooltipItem
} from 'chart.js'
import { Line } from 'react-chartjs-2'

import { generateRPMPowerSeries } from '../../core/charts/index.js'
import type { Spindle } from '../../core/data/schemas/index.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export interface RPMPowerChartProps {
  spindle: Spindle
  currentRPM?: number // Highlight current operating point
  width?: number
  height?: number
}

export function RPMPowerChart({ spindle, currentRPM, width = 400, height = 300 }: RPMPowerChartProps) {
  // Generate chart data using memoized computation
  const powerSeries = generateRPMPowerSeries({ spindle, pointCount: 50 })
  
  // Prepare Chart.js data
  const chartData = {
    labels: powerSeries.map(point => point.rpm.toString()),
    datasets: [
      {
        label: 'Available Power',
        data: powerSeries.map(point => point.powerW),
        borderColor: 'rgb(59, 130, 246)', // Blue
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 6
      }
    ]
  }
  
  // Add current operating point if provided
  if (currentRPM && currentRPM >= spindle.rpm_min && currentRPM <= spindle.rpm_max) {
    const currentPointData = powerSeries.map(point => 
      Math.abs(point.rpm - currentRPM) < 100 ? point.powerW : null
    )
    
    ;(chartData.datasets as unknown[]).push({
      label: 'Current Operating Point',
      data: currentPointData,
      borderColor: 'rgb(239, 68, 68)', // Red
      backgroundColor: 'rgb(239, 68, 68)',
      borderWidth: 3,
      fill: false,
      pointRadius: 8,
      pointHoverRadius: 10,
      showLine: false
    })
  }
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: true,
        text: 'Spindle Power vs RPM',
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          title: (tooltipItems: TooltipItem<'line'>[]) => {
            return `RPM: ${tooltipItems[0].label}`
          },
          label: (context: TooltipItem<'line'>) => {
            const value = context.parsed.y
            if (value === null) return ''
            
            const powerKW = (value / 1000).toFixed(2)
            const powerHP = (value / 746).toFixed(2) // Convert W to HP
            
            return `${context.dataset.label}: ${value.toFixed(0)} W (${powerKW} kW, ${powerHP} HP)`
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'RPM',
          font: {
            weight: 'bold' as const
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Power (W)',
          font: {
            weight: 'bold' as const
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        beginAtZero: true
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  }

  return (
    <div style={{ width, height, position: 'relative' }}>
      <Line data={chartData} options={options} />
    </div>
  )
}