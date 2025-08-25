export function EducationSection() {
  return (
    <div>
      <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>
        CNC Parameter Education
      </h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '16px' 
      }}>
        
        {/* Spindle Speed Effects */}
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #e5e5e5',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#2563eb' }}>
            Spindle Speed Effects
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#4b5563' }}>
            Learn how spindle speed (RPM) affects cut quality, surface finish, tool life, and material removal efficiency.
          </p>
          <ul style={{ margin: '0', fontSize: '13px', color: '#6b7280', paddingLeft: '16px' }}>
            <li>Surface speed calculations and optimization</li>
            <li>Material-specific speed considerations</li>
            <li>Tool diameter effects on speed selection</li>
            <li>Signs of incorrect spindle speeds</li>
          </ul>
        </div>

        {/* Feed Rate Impacts */}
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #e5e5e5',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#2563eb' }}>
            Feed Rate Impacts
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#4b5563' }}>
            Understand how feed rates affect surface finish quality, tool longevity, and machining productivity.
          </p>
          <ul style={{ margin: '0', fontSize: '13px', color: '#6b7280', paddingLeft: '16px' }}>
            <li>Feed rate vs. chip load relationships</li>
            <li>Material-specific feed considerations</li>
            <li>Balancing quality and productivity</li>
            <li>Tool geometry and feed interactions</li>
          </ul>
        </div>

        {/* Chip Load Relationships */}
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #e5e5e5',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#2563eb' }}>
            Chip Load Relationships
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#4b5563' }}>
            Explore how chip load affects material removal rates, tool wear patterns, and cutting efficiency.
          </p>
          <ul style={{ margin: '0', fontSize: '13px', color: '#6b7280', paddingLeft: '16px' }}>
            <li>Chip load calculations and optimization</li>
            <li>Material removal rate relationships</li>
            <li>Tool wear mechanisms and prevention</li>
            <li>Chip thinning effects and compensation</li>
          </ul>
        </div>

        {/* Troubleshooting Guide */}
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #e5e5e5',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#2563eb' }}>
            Troubleshooting Guide
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#4b5563' }}>
            Comprehensive guide to diagnosing and solving common CNC machining problems.
          </p>
          <ul style={{ margin: '0', fontSize: '13px', color: '#6b7280', paddingLeft: '16px' }}>
            <li>Surface finish and chatter issues</li>
            <li>Tool wear and breakage problems</li>
            <li>Dimensional accuracy challenges</li>
            <li>Material-specific troubleshooting</li>
          </ul>
        </div>

      </div>

      {/* Quick Reference Section */}
      <div style={{ 
        marginTop: '24px',
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#1d4ed8' }}>
          📚 Quick Reference
        </h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '12px',
          fontSize: '13px'
        }}>
          <div>
            <strong>Aluminum:</strong> 200-1000 m/min surface speed, 0.05-0.3mm/tooth chip load
          </div>
          <div>
            <strong>Steel:</strong> 50-200 m/min surface speed, 0.02-0.15mm/tooth chip load
          </div>
          <div>
            <strong>Stainless:</strong> 30-120 m/min surface speed, 0.03-0.1mm/tooth chip load
          </div>
          <div>
            <strong>Cast Iron:</strong> 100-300 m/min surface speed, 0.02-0.12mm/tooth chip load
          </div>
        </div>
      </div>

      {/* Note about detailed documentation */}
      <div style={{ 
        marginTop: '16px',
        padding: '12px',
        background: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '6px',
        fontSize: '13px',
        color: '#92400e'
      }}>
        <strong>💡 Note:</strong> This is a summary of key educational concepts. For detailed explanations, 
        formulas, troubleshooting procedures, and material-specific guidance, refer to the comprehensive 
        documentation in the <code>docs/education/</code> directory of this project.
      </div>
    </div>
  )
}