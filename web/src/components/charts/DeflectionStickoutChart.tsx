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

import { generateDeflectionStickoutSeries } from '../../core/charts/index.js'
import type { Tool } from '../../core/data/schemas/index.js'

// Register Chart.js components (already registered in RPMPowerChart, but this ensures independence)
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

export interface DeflectionStickoutChartProps {
  tool: Tool
  forceN: number
  rpm: number
  flutes: number
  currentStickoutMm?: number // Highlight current stickout
  width?: number
  height?: number
}

export function DeflectionStickoutChart({ 
  tool, 
  forceN, 
  rpm, 
  flutes, 
  currentStickoutMm, 
  width = 400, 
  height = 300 
}: DeflectionStickoutChartProps) {
  // Generate chart data using memoized computation
  const deflectionSeries = generateDeflectionStickoutSeries({
    tool,
    forceN,
    rpm,
    flutes,
    pointCount: 30
  })
  
  // Prepare Chart.js data
  const chartData = {
    labels: deflectionSeries.map(point => point.stickoutMm.toString()),
    datasets: [
      {
        label: 'Tool Deflection',
        data: deflectionSeries.map(point => point.deflectionMm),
        borderColor: 'rgb(16, 185, 129)', // Green
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 6
      }
    ]
  }
  
  // Add current operating point if provided
  if (currentStickoutMm) {
    const currentToolData = deflectionSeries.map(point => 
      Math.abs(point.stickoutMm - currentStickoutMm) < 1.0 ? point.deflectionMm : null
    )
    
    ;(chartData.datasets as unknown[]).push({
      label: 'Current Tool',
      data: currentToolData,
      borderColor: 'rgb(239, 68, 68)', // Red
      backgroundColor: 'rgb(239, 68, 68)',
      borderWidth: 3,
      fill: false,
      pointRadius: 8,
      pointHoverRadius: 10,
      showLine: false
    })
  }
  
  // Add warning zones for deflection thresholds
  const maxDeflection = Math.max(...deflectionSeries.map(p => p.deflectionMm))
  const warningThreshold = 0.02 // 0.02mm warning threshold
  const dangerThreshold = 0.05 // 0.05mm danger threshold
  
  if (maxDeflection > warningThreshold) {
    // Add warning zone
    ;(chartData.datasets as unknown[]).push({
      label: 'Warning Zone (>0.02mm)',
      data: deflectionSeries.map(() => warningThreshold),
      borderColor: 'rgba(251, 191, 36, 0.8)', // Yellow
      backgroundColor: 'rgba(251, 191, 36, 0.1)',
      borderWidth: 1,
      borderDash: [5, 5],
      fill: false,
      pointRadius: 0,
      pointHoverRadius: 0
    })
  }
  
  if (maxDeflection > dangerThreshold) {
    // Add danger zone
    ;(chartData.datasets as unknown[]).push({
      label: 'Danger Zone (>0.05mm)',
      data: deflectionSeries.map(() => dangerThreshold),
      borderColor: 'rgba(239, 68, 68, 0.8)', // Red
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderWidth: 1,
      borderDash: [10, 5],
      fill: false,
      pointRadius: 0,
      pointHoverRadius: 0
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
        text: 'Tool Deflection vs Stickout',
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
            return `Stickout: ${tooltipItems[0].label} mm`
          },
          label: (context: TooltipItem<'line'>) => {
            const value = context.parsed.y
            if (value === null) return ''
            
            if (context.dataset.label?.includes('Zone')) {
              return `${context.dataset.label}: ${value.toFixed(3)} mm`
            }
            
            const deflectionMicrons = (value * 1000).toFixed(1)
            const deflectionMils = (value / 0.0254).toFixed(3) // Convert mm to mils
            
            return `${context.dataset.label}: ${value.toFixed(3)} mm (${deflectionMicrons} μm, ${deflectionMils} mil)`
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Stickout (mm)',
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
          text: 'Deflection (mm)',
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