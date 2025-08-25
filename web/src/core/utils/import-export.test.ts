import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import {
  exportBundle,
  downloadBundle,
  importBundle,
  createFileImportInput
} from './import-export.js'
import type { Bundle, Settings, Libraries } from '../data/schemas/bundle.js'

// Mock DOM APIs
const mockCreateElement = vi.fn()
const mockAppendChild = vi.fn()
const mockRemoveChild = vi.fn()
const mockClick = vi.fn()
const mockCreateObjectURL = vi.fn()
const mockRevokeObjectURL = vi.fn()

beforeEach(() => {
  // Reset mocks
  mockCreateElement.mockReset()
  mockAppendChild.mockReset()
  mockRemoveChild.mockReset()
  mockClick.mockReset()
  mockCreateObjectURL.mockReset()
  mockRevokeObjectURL.mockReset()

  // Mock DOM
  global.document = {
    createElement: mockCreateElement,
    body: {
      appendChild: mockAppendChild,
      removeChild: mockRemoveChild
    }
  } as any

  global.URL = {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL
  } as any

  global.Blob = vi.fn() as any
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Import/Export Utilities', () => {
  describe('exportBundle', () => {
    it('should create a valid bundle with version and timestamp', () => {
      const settings: Settings = {
        aggressiveness: 1.5,
        cutType: 'slot'
      }
      const libraries: Libraries = {
        materials: []
      }

      const bundle = exportBundle(settings, libraries)

      expect(bundle.version).toBe('1.0')
      expect(bundle.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      expect(bundle.settings).toEqual(settings)
      expect(bundle.libraries).toEqual(libraries)
    })

    it('should handle empty settings and libraries', () => {
      const settings: Settings = {}
      const libraries: Libraries = {}

      const bundle = exportBundle(settings, libraries)

      expect(bundle.settings).toEqual({})
      expect(bundle.libraries).toEqual({})
    })
  })

  describe('downloadBundle', () => {
    it('should create download link with correct attributes', () => {
      const mockLink = {
        href: '',
        download: '',
        click: mockClick
      }
      mockCreateElement.mockReturnValue(mockLink)
      mockCreateObjectURL.mockReturnValue('blob:url')

      const bundle: Bundle = {
        version: '1.0',
        timestamp: '2024-01-01T00:00:00.000Z',
        settings: {},
        libraries: {}
      }

      downloadBundle(bundle)

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockLink.href).toBe('blob:url')
      expect(mockLink.download).toMatch(/^justthechips-settings-\d{4}-\d{2}-\d{2}\.json$/)
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink)
      expect(mockClick).toHaveBeenCalled()
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink)
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:url')
    })

    it('should use custom filename when provided', () => {
      const mockLink = {
        href: '',
        download: '',
        click: mockClick
      }
      mockCreateElement.mockReturnValue(mockLink)
      mockCreateObjectURL.mockReturnValue('blob:url')

      const bundle: Bundle = {
        version: '1.0',
        timestamp: '2024-01-01T00:00:00.000Z',
        settings: {},
        libraries: {}
      }

      downloadBundle(bundle, 'custom-filename.json')

      expect(mockLink.download).toBe('custom-filename.json')
    })
  })

  describe('importBundle', () => {
    it('should successfully import valid bundle', () => {
      const validBundle: Bundle = {
        version: '1.0',
        timestamp: '2024-01-01T00:00:00.000Z',
        settings: {
          aggressiveness: 1.5,
          cutType: 'slot'
        },
        libraries: {
          materials: [],
          machines: [],
          tools: [],
          spindles: []
        }
      }

      const result = importBundle(validBundle)

      expect(result.success).toBe(true)
      expect(result.data?.settings).toEqual(validBundle.settings)
      expect(result.data?.libraries).toEqual(validBundle.libraries)
      expect(result.errors).toBeUndefined()
    })

    it('should reject invalid bundle format', () => {
      const invalidBundle = {
        version: '2.0', // Invalid version
        settings: {},
        libraries: {}
      }

      const result = importBundle(invalidBundle)

      expect(result.success).toBe(false)
      expect(result.errors).toContain('Invalid bundle format:')
      expect(result.data).toBeUndefined()
    })

    it('should reject bundle with invalid settings', () => {
      const invalidBundle = {
        version: '1.0',
        timestamp: '2024-01-01T00:00:00.000Z',
        settings: {
          aggressiveness: -1 // Invalid value
        },
        libraries: {}
      }

      const result = importBundle(invalidBundle)

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })

    it('should reject bundle with invalid library data', () => {
      const invalidBundle = {
        version: '1.0',
        timestamp: '2024-01-01T00:00:00.000Z',
        settings: {},
        libraries: {
          materials: [{
            id: 'test',
            // Missing required fields
          }]
        }
      }

      const result = importBundle(invalidBundle)

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.some(e => e.includes('libraries.materials'))).toBe(true)
    })

    it('should handle non-object input', () => {
      const result = importBundle('invalid')

      expect(result.success).toBe(false)
      expect(result.errors).toContain('Invalid bundle format:')
    })

    it('should handle null/undefined input', () => {
      const nullResult = importBundle(null)
      expect(nullResult.success).toBe(false)

      const undefinedResult = importBundle(undefined)
      expect(undefinedResult.success).toBe(false)
    })
  })

  describe('createFileImportInput', () => {
    it('should create file input with correct attributes', () => {
      const mockInput = {
        type: '',
        accept: '',
        style: { display: '' },
        addEventListener: vi.fn()
      }
      mockCreateElement.mockReturnValue(mockInput)

      const onImport = vi.fn()
      const input = createFileImportInput(onImport)

      expect(mockCreateElement).toHaveBeenCalledWith('input')
      expect(mockInput.type).toBe('file')
      expect(mockInput.accept).toBe('.json')
      expect(mockInput.style.display).toBe('none')
      expect(mockInput.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
      expect(input).toBe(mockInput)
    })

    it('should handle file reading success', () => {
      const mockInput = {
        type: 'file',
        accept: '.json',
        style: { display: 'none' },
        addEventListener: vi.fn()
      }
      mockCreateElement.mockReturnValue(mockInput)

      const onImport = vi.fn()
      const onError = vi.fn()
      createFileImportInput(onImport, onError)

      // Get the change event handler
      const changeHandler = mockInput.addEventListener.mock.calls[0][1]

      // Mock file and FileReader
      const mockFile = new File(['{"version":"1.0","timestamp":"2024-01-01T00:00:00.000Z","settings":{},"libraries":{}}'], 'test.json')
      const mockEvent = {
        target: {
          files: [mockFile]
        }
      }

      global.FileReader = vi.fn().mockImplementation(() => ({
        readAsText: vi.fn().mockImplementation(function(this: any) {
          this.onload({
            target: {
              result: '{"version":"1.0","timestamp":"2024-01-01T00:00:00.000Z","settings":{},"libraries":{}}'
            }
          })
        }),
        onerror: vi.fn()
      })) as any

      changeHandler(mockEvent)

      expect(onImport).toHaveBeenCalledWith({
        success: true,
        data: {
          settings: {},
          libraries: {}
        }
      })
      expect(onError).not.toHaveBeenCalled()
    })

    it('should handle JSON parse errors', () => {
      const mockInput = {
        type: 'file',
        accept: '.json',
        style: { display: 'none' },
        addEventListener: vi.fn()
      }
      mockCreateElement.mockReturnValue(mockInput)

      const onImport = vi.fn()
      const onError = vi.fn()
      createFileImportInput(onImport, onError)

      const changeHandler = mockInput.addEventListener.mock.calls[0][1]
      const mockFile = new File(['invalid json'], 'test.json')
      const mockEvent = {
        target: {
          files: [mockFile]
        }
      }

      global.FileReader = vi.fn().mockImplementation(() => ({
        readAsText: vi.fn().mockImplementation(function(this: any) {
          this.onload({
            target: {
              result: 'invalid json'
            }
          })
        }),
        onerror: vi.fn()
      })) as any

      changeHandler(mockEvent)

      expect(onError).toHaveBeenCalledWith(expect.stringContaining('Unexpected token'))
      expect(onImport).not.toHaveBeenCalled()
    })

    it('should handle file read errors', () => {
      const mockInput = {
        type: 'file',
        accept: '.json',
        style: { display: 'none' },
        addEventListener: vi.fn()
      }
      mockCreateElement.mockReturnValue(mockInput)

      const onImport = vi.fn()
      const onError = vi.fn()
      createFileImportInput(onImport, onError)

      const changeHandler = mockInput.addEventListener.mock.calls[0][1]
      const mockFile = new File(['test'], 'test.json')
      const mockEvent = {
        target: {
          files: [mockFile]
        }
      }

      global.FileReader = vi.fn().mockImplementation(() => ({
        readAsText: vi.fn().mockImplementation(function(this: any) {
          this.onerror()
        }),
        onerror: vi.fn()
      })) as any

      changeHandler(mockEvent)

      expect(onError).toHaveBeenCalledWith('Failed to read file')
      expect(onImport).not.toHaveBeenCalled()
    })

    it('should handle no file selected', () => {
      const mockInput = {
        type: 'file',
        accept: '.json',
        style: { display: 'none' },
        addEventListener: vi.fn()
      }
      mockCreateElement.mockReturnValue(mockInput)

      const onImport = vi.fn()
      createFileImportInput(onImport)

      const changeHandler = mockInput.addEventListener.mock.calls[0][1]
      const mockEvent = {
        target: {
          files: null
        }
      }

      changeHandler(mockEvent)

      expect(onImport).not.toHaveBeenCalled()
    })
  })
})