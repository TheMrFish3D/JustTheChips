import { type ReactNode } from 'react'

import { getEducationalContent, type EducationalContent } from './educationalContent.js'
import { Tooltip } from './Tooltip.js'

interface EducationalTooltipProps {
  contentKey: string
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

function EducationalTooltipContent({ content }: { content: EducationalContent }) {
  return (
    <div style={{ maxWidth: '400px' }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '16px' }}>
        {content.title}
      </div>
      
      <div style={{ marginBottom: '12px', lineHeight: '1.5' }}>
        {content.description}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontWeight: '600', color: '#60a5fa', marginBottom: '4px' }}>
          Why it matters:
        </div>
        <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
          {content.whyItMatters}
        </div>
      </div>

      {content.effects && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontWeight: '600', color: '#34d399', marginBottom: '4px' }}>
            Effects:
          </div>
          <div style={{ fontSize: '13px', lineHeight: '1.3' }}>
            {content.effects.tooLow && (
              <div style={{ marginBottom: '2px' }}>
                <span style={{ color: '#fbbf24' }}>Too Low:</span> {content.effects.tooLow}
              </div>
            )}
            {content.effects.tooHigh && (
              <div style={{ marginBottom: '2px' }}>
                <span style={{ color: '#f87171' }}>Too High:</span> {content.effects.tooHigh}
              </div>
            )}
            {content.effects.optimal && (
              <div>
                <span style={{ color: '#34d399' }}>Optimal:</span> {content.effects.optimal}
              </div>
            )}
          </div>
        </div>
      )}

      {content.troubleshooting && content.troubleshooting.length > 0 && (
        <div>
          <div style={{ fontWeight: '600', color: '#a78bfa', marginBottom: '4px' }}>
            Troubleshooting:
          </div>
          <div style={{ fontSize: '13px', lineHeight: '1.3' }}>
            {content.troubleshooting.map((item, index) => (
              <div key={index} style={{ marginBottom: '3px' }}>
                <div style={{ color: '#fbbf24' }}>{item.problem}</div>
                <div style={{ marginLeft: '8px', color: '#e5e7eb' }}>→ {item.solution}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function EducationalTooltip({ contentKey, children, position = 'top' }: EducationalTooltipProps) {
  const content = getEducationalContent(contentKey)
  
  if (!content) {
    return <>{children}</>
  }

  return (
    <Tooltip
      content={<EducationalTooltipContent content={content} />}
      position={position}
      delay={500}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {children}
        <span style={{ 
          color: '#60a5fa', 
          cursor: 'help',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          ℹ️
        </span>
      </div>
    </Tooltip>
  )
}