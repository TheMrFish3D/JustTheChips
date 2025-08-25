import { useState, type ReactNode } from 'react'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

export function Tooltip({ content, children, position = 'top', delay = 300 }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const showTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    const id = setTimeout(() => setIsVisible(true), delay)
    setTimeoutId(id)
  }

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setIsVisible(false)
  }

  const getTooltipStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      background: '#1f2937',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '14px',
      lineHeight: '1.4',
      whiteSpace: 'normal' as const,
      zIndex: 1000,
      opacity: isVisible ? 1 : 0,
      visibility: isVisible ? 'visible' as const : 'hidden' as const,
      transition: 'opacity 0.2s, visibility 0.2s',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      maxWidth: '300px'
    }

    switch (position) {
      case 'top':
        return {
          ...baseStyle,
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px'
        }
      case 'bottom':
        return {
          ...baseStyle,
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '8px'
        }
      case 'left':
        return {
          ...baseStyle,
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginRight: '8px'
        }
      case 'right':
        return {
          ...baseStyle,
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginLeft: '8px'
        }
      default:
        return baseStyle
    }
  }

  const getArrowStyle = () => {
    const arrowSize = '6px'
    const arrowColor = '#1f2937'

    const baseArrow = {
      position: 'absolute' as const,
      width: 0,
      height: 0,
      border: `${arrowSize} solid transparent`
    }

    switch (position) {
      case 'top':
        return {
          ...baseArrow,
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderTopColor: arrowColor,
          borderBottomWidth: 0
        }
      case 'bottom':
        return {
          ...baseArrow,
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderBottomColor: arrowColor,
          borderTopWidth: 0
        }
      case 'left':
        return {
          ...baseArrow,
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          borderLeftColor: arrowColor,
          borderRightWidth: 0
        }
      case 'right':
        return {
          ...baseArrow,
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          borderRightColor: arrowColor,
          borderLeftWidth: 0
        }
      default:
        return baseArrow
    }
  }

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      <div style={getTooltipStyle()}>
        {content}
        <div style={getArrowStyle()} />
      </div>
    </div>
  )
}