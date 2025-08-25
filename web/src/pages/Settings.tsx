import { useState, useCallback } from 'react'

import { materials, machines, tools, spindles } from '../core/data/index.js'
import type { Settings, Libraries } from '../core/data/schemas/index.js'
import { exportBundle, downloadBundle, createFileImportInput, type ImportResult } from '../core/utils/index.js'
import { useCalculatorStore } from '../store/index.js'

export default function Settings() {
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | 'info' | null
    message: string
  }>({ type: null, message: '' })

  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  // Get current calculator state for export
  const store = useCalculatorStore()
  const currentInputs = store.getInputs()

  const clearStatus = useCallback(() => {
    setImportStatus({ type: null, message: '' })
  }, [])

  const handleExport = useCallback(() => {
    try {
      setIsExporting(true)
      clearStatus()

      // Create settings from current calculator state
      const settings: Settings = {
        machineId: currentInputs.machineId,
        spindleId: currentInputs.spindleId,
        toolId: currentInputs.toolId,
        materialId: currentInputs.materialId,
        cutType: currentInputs.cutType,
        aggressiveness: currentInputs.aggressiveness,
        user_doc_mm: currentInputs.user_doc_mm,
        user_woc_mm: currentInputs.user_woc_mm,
        override_flutes: currentInputs.override_flutes,
        override_stickout_mm: currentInputs.override_stickout_mm,
      }

      // Create libraries bundle (currently exports the built-in libraries)
      // In a full implementation, this would include user-added custom libraries
      const libraries: Libraries = {
        materials: materials,
        machines: machines,
        tools: tools,
        spindles: spindles,
      }

      const bundle = exportBundle(settings, libraries)
      downloadBundle(bundle)

      setImportStatus({
        type: 'success',
        message: 'Settings and libraries exported successfully!'
      })
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setIsExporting(false)
    }
  }, [currentInputs, clearStatus])

  const handleImportResult = useCallback((result: ImportResult) => {
    setIsImporting(false)
    
    if (result.success && result.data) {
      // Backup current state for rollback
      const backupInputs = store.getInputs()
      
      try {
        // Apply imported settings
        const settings = result.data.settings
        store.setInputs({
          machineId: settings.machineId,
          spindleId: settings.spindleId,
          toolId: settings.toolId,
          materialId: settings.materialId,
          cutType: settings.cutType,
          aggressiveness: settings.aggressiveness,
          user_doc_mm: settings.user_doc_mm,
          user_woc_mm: settings.user_woc_mm,
          override_flutes: settings.override_flutes,
          override_stickout_mm: settings.override_stickout_mm,
        })

        // TODO: In a full implementation, also apply imported libraries
        // This would require a mechanism to merge/replace library data

        setImportStatus({
          type: 'success',
          message: 'Settings imported successfully! Library import is not yet implemented.'
        })
      } catch (error) {
        // Rollback on error
        store.setInputs(backupInputs)
        setImportStatus({
          type: 'error',
          message: `Failed to apply imported settings: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
      }
    } else {
      setImportStatus({
        type: 'error',
        message: `Import failed: ${result.errors?.join(', ') || 'Unknown error'}`
      })
    }
  }, [store])

  const handleImport = useCallback(() => {
    setIsImporting(true)
    clearStatus()
    
    const input = createFileImportInput(handleImportResult)
    document.body.appendChild(input)
    input.click()
    document.body.removeChild(input)
  }, [handleImportResult, clearStatus])

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Settings</h2>
      
      {/* Import/Export Section */}
      <section style={{ marginBottom: '32px' }}>
        <h3>Import/Export Configuration</h3>
        <p style={{ color: '#666', marginBottom: '16px' }}>
          Export your current calculator settings and libraries to a JSON file, or import a previously saved configuration.
          This includes tool selections, material choices, aggressiveness settings, and custom library data.
        </p>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={handleExport}
            disabled={isExporting}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              opacity: isExporting ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
          >
            {isExporting ? '📤 Exporting...' : '📤 Export Settings'}
          </button>
          
          <button
            onClick={handleImport}
            disabled={isImporting}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isImporting ? 'not-allowed' : 'pointer',
              opacity: isImporting ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
          >
            {isImporting ? '📥 Importing...' : '📥 Import Settings'}
          </button>
        </div>

        {/* Status Messages */}
        {importStatus.type && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '6px',
              border: '1px solid',
              backgroundColor: importStatus.type === 'success' ? '#d4edda' : importStatus.type === 'error' ? '#f8d7da' : '#d1ecf1',
              borderColor: importStatus.type === 'success' ? '#c3e6cb' : importStatus.type === 'error' ? '#f5c6cb' : '#bee5eb',
              color: importStatus.type === 'success' ? '#155724' : importStatus.type === 'error' ? '#721c24' : '#0c5460',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{importStatus.message}</span>
              <button
                onClick={clearStatus}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  color: 'inherit',
                  padding: '0 4px'
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div style={{ fontSize: '14px', color: '#666' }}>
          <h4>Export includes:</h4>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Current calculator settings (tool, material, machine selections)</li>
            <li>Custom aggressiveness and override values</li>
            <li>Built-in material, machine, tool, and spindle libraries</li>
          </ul>
          
          <h4>Import features:</h4>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Validates file format and data integrity</li>
            <li>Shows detailed error messages for invalid files</li>
            <li>Automatically rolls back changes on import failure</li>
            <li>Preserves your current settings if import fails</li>
          </ul>
        </div>
      </section>

      {/* Future Settings Sections */}
      <section style={{ marginBottom: '32px' }}>
        <h3>Application Preferences</h3>
        <p style={{ color: '#666', fontStyle: 'italic' }}>
          Additional settings will be implemented in future versions:
        </p>
        <ul style={{ color: '#666', marginLeft: '20px' }}>
          <li>Units (metric/imperial)</li>
          <li>Default aggressiveness</li>
          <li>Warning thresholds</li>
          <li>Display preferences</li>
        </ul>
      </section>
    </div>
  )
}