import { useState } from 'react'

import type { CutType } from '../../core/data/schemas/inputs.js'
import { useCalculatorStore } from '../../store/index.js'
import { useInputValidation } from '../../store/useInputValidation.js'
import { EducationSection } from '../calculator/EducationSection.js'
import { NumericInputWithUnits, EducationalTooltip } from '../ui/index.js'

const cutTypes: { value: CutType; label: string }[] = [
  { value: 'slot', label: 'Slotting' },
  { value: 'profile', label: 'Profile' },
  { value: 'adaptive', label: 'Adaptive' },
  { value: 'facing', label: 'Facing' },
  { value: 'drilling', label: 'Drilling' },
  { value: 'boring', label: 'Boring' }
]

type TabType = 'basic' | 'advanced' | 'locked' | 'education'

export function MainParametersArea() {
  const [activeTab, setActiveTab] = useState<TabType>('basic')
  const store = useCalculatorStore()
  const { getFieldError, getFieldWarnings } = useInputValidation()

  const tabStyle = (isActive: boolean) => ({
    padding: '12px 24px',
    border: 'none',
    background: isActive ? 'white' : '#f1f5f9',
    color: isActive ? '#2563eb' : '#64748b',
    borderBottom: isActive ? '3px solid #2563eb' : '1px solid #e2e8f0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '500',
    transition: 'all 0.2s'
  })

  return (
    <div style={{ 
      background: 'white',
      border: '1px solid #e5e5e5',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      
      {/* Tab Headers */}
      <div style={{ 
        display: 'flex',
        background: '#f8f9fa',
        borderBottom: '1px solid #e5e5e5'
      }}>
        <button
          onClick={() => setActiveTab('basic')}
          style={tabStyle(activeTab === 'basic')}
        >
          Basic
        </button>
        <button
          onClick={() => setActiveTab('advanced')}
          style={tabStyle(activeTab === 'advanced')}
        >
          Advanced
        </button>
        <button
          onClick={() => setActiveTab('locked')}
          style={tabStyle(activeTab === 'locked')}
        >
          Locked Values
        </button>
        <button
          onClick={() => setActiveTab('education')}
          style={tabStyle(activeTab === 'education')}
        >
          📚 Education
        </button>
      </div>
      
      {/* Tab Content */}
      <div style={{ padding: '20px' }}>
        
        {/* Basic Tab */}
        {activeTab === 'basic' && (
          <div>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>
              Cutting Parameters
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px' 
            }}>
              
              {/* Cut Type Selection */}
              <div>
                <EducationalTooltip contentKey="cutType" position="bottom">
                  <label htmlFor="cutType" style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Cut Type
                    <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                </EducationalTooltip>
                <select
                  id="cutType"
                  value={store.cutType || ''}
                  onChange={(e) => store.setInput('cutType', e.target.value as CutType)}
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select cut type</option>
                  {cutTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Radial Engagement */}
              <div>
                <EducationalTooltip contentKey="radialEngagement" position="bottom">
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Radial Engagement (%)
                  </label>
                </EducationalTooltip>
                <NumericInputWithUnits
                  id="user_woc_mm"
                  label=""
                  unit="%"
                  value={store.user_woc_mm ? (store.user_woc_mm * 100) : undefined}
                  min={1}
                  max={100}
                  step={1}
                  placeholder="40"
                  onChange={(value) => store.setInput('user_woc_mm', value ? value / 100 : undefined)}
                  error={getFieldError('user_woc_mm')}
                  warning={getFieldWarnings('user_woc_mm')[0]?.message}
                />
              </div>
              
              {/* Aggressiveness */}
              <div>
                <EducationalTooltip contentKey="aggressiveness" position="bottom">
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '6px', 
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Aggressiveness
                  </label>
                </EducationalTooltip>
                <NumericInputWithUnits
                  id="aggressiveness"
                  label=""
                  value={store.aggressiveness}
                  min={0.1}
                  max={3.0}
                  step={0.1}
                  placeholder="1.0"
                  onChange={(value) => store.setInput('aggressiveness', value)}
                  error={getFieldError('aggressiveness')}
                  warning={getFieldWarnings('aggressiveness')[0]?.message}
                />
              </div>
              
              {/* Target Finish */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Target Finish
                </label>
                <select
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  defaultValue="roughing"
                >
                  <option value="roughing">Roughing</option>
                  <option value="semi-finishing">Semi-finishing</option>
                  <option value="finishing">Finishing</option>
                </select>
              </div>
              
            </div>
          </div>
        )}
        
        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>
              Advanced Parameters
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px' 
            }}>
              
              {/* User DOC */}
              <NumericInputWithUnits
                id="user_doc_mm"
                label="Depth of Cut"
                unit="mm"
                value={store.user_doc_mm}
                min={0}
                step={0.1}
                placeholder="Auto"
                onChange={(value) => store.setInput('user_doc_mm', value)}
                error={getFieldError('user_doc_mm')}
                warning={getFieldWarnings('user_doc_mm')[0]?.message}
              />
              
              {/* Override Flutes */}
              <NumericInputWithUnits
                id="override_flutes"
                label="Number of Flutes"
                value={store.override_flutes}
                min={1}
                step={1}
                placeholder="Auto"
                onChange={(value) => store.setInput('override_flutes', value)}
                error={getFieldError('override_flutes')}
                warning={getFieldWarnings('override_flutes')[0]?.message}
              />
              
              {/* Override Stickout */}
              <NumericInputWithUnits
                id="override_stickout_mm"
                label="Tool Stickout"
                unit="mm"
                value={store.override_stickout_mm}
                min={0}
                step={0.1}
                placeholder="Auto"
                onChange={(value) => store.setInput('override_stickout_mm', value)}
                error={getFieldError('override_stickout_mm')}
                warning={getFieldWarnings('override_stickout_mm')[0]?.message}
              />
              
            </div>
          </div>
        )}
        
        {/* Locked Values Tab */}
        {activeTab === 'locked' && (
          <div>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>
              Locked Values
            </h3>
            
            <div style={{ 
              padding: '16px',
              background: '#f8f9fa',
              border: '1px solid #e5e5e5',
              borderRadius: '6px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <p style={{ margin: 0, fontStyle: 'italic' }}>
                No values are currently locked. This feature allows you to lock specific calculated values 
                and optimize around them.
              </p>
            </div>
          </div>
        )}

        {/* Education Tab */}
        {activeTab === 'education' && (
          <EducationSection />
        )}
        
      </div>
    </div>
  )
}