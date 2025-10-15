import React from 'react'
import { X, Plus, Trash2, Settings } from 'lucide-react'
import { useFlowStore } from '../state/store'
import type { AnyElement } from '../types'

interface PropertyEditorInlineProps {
  screenId: string
  element: AnyElement
  onClose: () => void
}

export default function PropertyEditorInline({ screenId, element, onClose }: PropertyEditorInlineProps) {
  const { updateElement } = useFlowStore()
  const [localElement, setLocalElement] = React.useState(element)

  React.useEffect(() => {
    setLocalElement(element)
  }, [element])

  const handleSave = () => {
    updateElement(screenId, localElement)
    onClose()
  }

  const updateField = (field: string, value: any) => {
    const updated = { ...localElement, [field]: value } as AnyElement
    setLocalElement(updated)
    // Auto-save on change
    updateElement(screenId, updated)
  }

  return (
    <div className="bg-white border-2 border-primary-200 rounded-xl p-5 space-y-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <Settings className="w-4 h-4 text-primary-600" />
          </div>
          <h4 className="font-bold text-gray-900 text-base">Edit {element.type}</h4>
        </div>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors p-2 rounded-lg"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Fields */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {renderFields(localElement, updateField)}
      </div>
    </div>
  )
}

function renderFields(el: AnyElement, update: (field: string, value: any) => void) {
  switch (el.type) {
    case 'TextHeading':
      return (
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">Text</label>
          <input
            type="text"
            value={el.text}
            onChange={(e) => update('text', e.target.value)}
            className="input-field text-sm"
            placeholder="Enter heading text"
          />
        </div>
      )
    case 'TextSubheading':
      return (
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">Text</label>
          <input
            type="text"
            value={el.text}
            onChange={(e) => update('text', e.target.value)}
            className="input-field text-sm"
            placeholder="Enter subheading text"
          />
        </div>
      )
    case 'TextBody':
      return (
        <>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Text</label>
            <textarea
              value={el.text}
              onChange={(e) => update('text', e.target.value)}
              className="input-field text-sm"
              rows={3}
              placeholder="Enter body text"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Font Weight</label>
            <select
              value={el.fontWeight || 'normal'}
              onChange={(e) => update('fontWeight', e.target.value)}
              className="input-field text-sm"
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`strikethrough-${el.id}`}
              checked={!!el.strikethrough}
              onChange={(e) => update('strikethrough', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor={`strikethrough-${el.id}`} className="text-sm text-gray-700 font-medium">Strikethrough</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`markdown-${el.id}`}
              checked={!!el.markdown}
              onChange={(e) => update('markdown', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor={`markdown-${el.id}`} className="text-sm text-gray-700 font-medium">Enable Markdown</label>
          </div>
        </>
      )
    case 'TextCaption':
      return (
        <>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Text</label>
            <input
              type="text"
              value={el.text}
              onChange={(e) => update('text', e.target.value)}
              className="input-field text-sm"
              placeholder="Enter caption text"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Font Weight</label>
            <select
              value={el.fontWeight || 'normal'}
              onChange={(e) => update('fontWeight', e.target.value)}
              className="input-field text-sm"
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`strikethrough-${el.id}`}
              checked={!!el.strikethrough}
              onChange={(e) => update('strikethrough', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor={`strikethrough-${el.id}`} className="text-xs text-slate-300">Strikethrough</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`markdown-${el.id}`}
              checked={!!el.markdown}
              onChange={(e) => update('markdown', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor={`markdown-${el.id}`} className="text-xs text-slate-300">Enable Markdown</label>
          </div>
        </>
      )
    case 'RichText':
      return (
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Markdown Text</label>
          <textarea
            value={el.text}
            onChange={(e) => update('text', e.target.value)}
            className="input-field text-sm font-mono"
            rows={6}
            placeholder="# Heading&#10;&#10;**Bold** and *italic* text"
          />
          <p className="text-xs text-slate-500 mt-1">
            Supports Markdown syntax: **bold**, *italic*, # headings, etc.
          </p>
        </div>
      )

    case 'TextInput':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
              placeholder="Input label"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
              placeholder="field_name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Input Type</label>
            <select
              value={el.inputType || 'text'}
              onChange={(e) => update('inputType', e.target.value)}
              className="input-field text-sm"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="email">Email</option>
              <option value="password">Password</option>
              <option value="passcode">Passcode</option>
              <option value="phone">Phone</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Pattern (Regex)</label>
            <input
              type="text"
              value={el.pattern || ''}
              onChange={(e) => update('pattern', e.target.value)}
              className="input-field text-sm"
              placeholder="^[0-9]+$"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Helper Text</label>
            <input
              type="text"
              value={el.helperText || ''}
              onChange={(e) => update('helperText', e.target.value)}
              className="input-field text-sm"
              placeholder="E.g. Enter your phone number"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${el.id}`}
              checked={!!el.required}
              onChange={(e) => update('required', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor={`required-${el.id}`} className="text-sm text-gray-700 font-medium">Required field</label>
          </div>
        </>
      )

    case 'EmailInput':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
              placeholder="Email label"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
              placeholder="email_field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Helper Text</label>
            <input
              type="text"
              value={el.helperText || ''}
              onChange={(e) => update('helperText', e.target.value)}
              className="input-field text-sm"
              placeholder="E.g. Enter your email address"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${el.id}`}
              checked={!!el.required}
              onChange={(e) => update('required', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor={`required-${el.id}`} className="text-sm text-gray-700 font-medium">Required field</label>
          </div>
        </>
      )

    case 'PasswordInput':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
              placeholder="Password label"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
              placeholder="password_field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Min Characters</label>
            <input
              type="number"
              value={el.minChars || ''}
              onChange={(e) => update('minChars', e.target.value ? parseInt(e.target.value) : undefined)}
              className="input-field text-sm"
              placeholder="8"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Max Characters</label>
            <input
              type="number"
              value={el.maxChars || ''}
              onChange={(e) => update('maxChars', e.target.value ? parseInt(e.target.value) : undefined)}
              className="input-field text-sm"
              placeholder="50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Helper Text</label>
            <input
              type="text"
              value={el.helperText || ''}
              onChange={(e) => update('helperText', e.target.value)}
              className="input-field text-sm"
              placeholder="E.g. Must be at least 8 characters"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${el.id}`}
              checked={!!el.required}
              onChange={(e) => update('required', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor={`required-${el.id}`} className="text-sm text-gray-700 font-medium">Required field</label>
          </div>
        </>
      )

    case 'PhoneInput':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
              placeholder="Phone label"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
              placeholder="phone_field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Helper Text</label>
            <input
              type="text"
              value={el.helperText || ''}
              onChange={(e) => update('helperText', e.target.value)}
              className="input-field text-sm"
              placeholder="E.g. Include country code"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${el.id}`}
              checked={!!el.required}
              onChange={(e) => update('required', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor={`required-${el.id}`} className="text-sm text-gray-700 font-medium">Required field</label>
          </div>
        </>
      )

    case 'CheckboxGroup':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
              placeholder="Checkbox group label"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
              placeholder="checkbox_group"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Min Selected</label>
            <input
              type="number"
              value={el.minSelectedItems || ''}
              onChange={(e) => update('minSelectedItems', e.target.value ? parseInt(e.target.value) : undefined)}
              className="input-field text-sm"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Max Selected</label>
            <input
              type="number"
              value={el.maxSelectedItems || ''}
              onChange={(e) => update('maxSelectedItems', e.target.value ? parseInt(e.target.value) : undefined)}
              className="input-field text-sm"
              placeholder="No limit"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${el.id}`}
              checked={!!el.required}
              onChange={(e) => update('required', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor={`required-${el.id}`} className="text-sm text-gray-700 font-medium">Required field</label>
          </div>
          <OptionsEditor
            options={el.dataSource || []}
            onChange={(opts) => update('dataSource', opts)}
          />
        </>
      )

    case 'ChipsSelector':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
              placeholder="Chips selector label"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
              placeholder="chips_selector"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Min Selected</label>
            <input
              type="number"
              value={el.minSelectedItems || ''}
              onChange={(e) => update('minSelectedItems', e.target.value ? parseInt(e.target.value) : undefined)}
              className="input-field text-sm"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Max Selected</label>
            <input
              type="number"
              value={el.maxSelectedItems || ''}
              onChange={(e) => update('maxSelectedItems', e.target.value ? parseInt(e.target.value) : undefined)}
              className="input-field text-sm"
              placeholder="No limit"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${el.id}`}
              checked={!!el.required}
              onChange={(e) => update('required', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor={`required-${el.id}`} className="text-sm text-gray-700 font-medium">Required field</label>
          </div>
          <OptionsEditor
            options={el.dataSource || []}
            onChange={(opts) => update('dataSource', opts)}
          />
        </>
      )

    case 'OptIn':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
              placeholder="I agree to the terms"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
              placeholder="opt_in"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${el.id}`}
              checked={!!el.required}
              onChange={(e) => update('required', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor={`required-${el.id}`} className="text-sm text-gray-700 font-medium">Required field</label>
          </div>
        </>
      )

    case 'EmbeddedLink':
      return (
        <>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Text</label>
            <input
              type="text"
              value={el.text}
              onChange={(e) => update('text', e.target.value)}
              className="input-field text-sm"
              placeholder="Click here"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">URL</label>
            <input
              type="url"
              value={el.url || ''}
              onChange={(e) => update('url', e.target.value)}
              className="input-field text-sm"
              placeholder="https://example.com"
            />
          </div>
        </>
      )

    case 'DatePicker':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
              placeholder="Select date"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
              placeholder="date_picker"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Min Date</label>
            <input
              type="date"
              value={el.minDate || ''}
              onChange={(e) => update('minDate', e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Max Date</label>
            <input
              type="date"
              value={el.maxDate || ''}
              onChange={(e) => update('maxDate', e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Helper Text</label>
            <input
              type="text"
              value={el.helperText || ''}
              onChange={(e) => update('helperText', e.target.value)}
              className="input-field text-sm"
              placeholder="Select your preferred date"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${el.id}`}
              checked={!!el.required}
              onChange={(e) => update('required', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor={`required-${el.id}`} className="text-sm text-gray-700 font-medium">Required field</label>
          </div>
        </>
      )

    case 'CalendarPicker':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
              placeholder="Select date range"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
              placeholder="calendar_picker"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Mode</label>
            <select
              value={el.mode || 'single'}
              onChange={(e) => update('mode', e.target.value)}
              className="input-field text-sm"
            >
              <option value="single">Single Date</option>
              <option value="range">Date Range</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
            <input
              type="text"
              value={el.title || ''}
              onChange={(e) => update('title', e.target.value)}
              className="input-field text-sm"
              placeholder="Calendar title"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
            <input
              type="text"
              value={el.description || ''}
              onChange={(e) => update('description', e.target.value)}
              className="input-field text-sm"
              placeholder="Calendar description"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${el.id}`}
              checked={!!el.required}
              onChange={(e) => update('required', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor={`required-${el.id}`} className="text-sm text-gray-700 font-medium">Required field</label>
          </div>
        </>
      )

    case 'Image':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Image URL</label>
            <input
              type="url"
              value={el.src}
              onChange={(e) => update('src', e.target.value)}
              className="input-field text-sm"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Alt Text</label>
            <input
              type="text"
              value={el.altText || ''}
              onChange={(e) => update('altText', e.target.value)}
              className="input-field text-sm"
              placeholder="Image description"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Width</label>
            <input
              type="number"
              value={el.width || ''}
              onChange={(e) => update('width', e.target.value ? parseInt(e.target.value) : undefined)}
              className="input-field text-sm"
              placeholder="Auto"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Height</label>
            <input
              type="number"
              value={el.height || ''}
              onChange={(e) => update('height', e.target.value ? parseInt(e.target.value) : undefined)}
              className="input-field text-sm"
              placeholder="Auto"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Scale Type</label>
            <select
              value={el.scaleType || 'cover'}
              onChange={(e) => update('scaleType', e.target.value)}
              className="input-field text-sm"
            >
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
            </select>
          </div>
        </>
      )

    case 'ImageCarousel':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Scale Type</label>
            <select
              value={el.scaleType || 'cover'}
              onChange={(e) => update('scaleType', e.target.value)}
              className="input-field text-sm"
            >
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Aspect Ratio</label>
            <input
              type="text"
              value={el.aspectRatio || ''}
              onChange={(e) => update('aspectRatio', e.target.value)}
              className="input-field text-sm"
              placeholder="16:9"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-slate-400">Images</label>
              <button 
                onClick={() => {
                  const newImages = [...(el.images || []), { src: '', altText: '' }]
                  update('images', newImages)
                }}
                className="text-xs text-whatsapp-500 hover:text-whatsapp-400 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {(el.images || []).map((img: any, idx: number) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="url"
                    value={img.src}
                    onChange={(e) => {
                      const newImages = [...(el.images || [])]
                      newImages[idx] = { ...img, src: e.target.value }
                      update('images', newImages)
                    }}
                    className="input-field flex-1 text-xs"
                    placeholder="Image URL"
                  />
                  <input
                    type="text"
                    value={img.altText || ''}
                    onChange={(e) => {
                      const newImages = [...(el.images || [])]
                      newImages[idx] = { ...img, altText: e.target.value }
                      update('images', newImages)
                    }}
                    className="input-field flex-1 text-xs"
                    placeholder="Alt text"
                  />
                  <button
                    onClick={() => {
                      const newImages = (el.images || []).filter((_: any, i: number) => i !== idx)
                      update('images', newImages)
                    }}
                    className="text-red-500 hover:text-red-400 p-1"
                    aria-label="Remove image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )

    case 'NavigationList':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
              placeholder="navigation_list"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label || ''}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
              placeholder="Navigation list label"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
            <input
              type="text"
              value={el.description || ''}
              onChange={(e) => update('description', e.target.value)}
              className="input-field text-sm"
              placeholder="List description"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-slate-400">List Items</label>
              <button 
                onClick={() => {
                  const newItems = [...(el.listItems || []), { 
                    id: `item_${Date.now()}`, 
                    mainContent: { title: 'New Item', description: '' }
                  }]
                  update('listItems', newItems)
                }}
                className="text-xs text-whatsapp-500 hover:text-whatsapp-400 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {(el.listItems || []).map((item: any, idx: number) => (
                <div key={idx} className="border border-slate-600 rounded p-2 space-y-2">
                  <input
                    type="text"
                    value={item.mainContent?.title || ''}
                    onChange={(e) => {
                      const newItems = [...(el.listItems || [])]
                      newItems[idx] = { 
                        ...item, 
                        mainContent: { ...item.mainContent, title: e.target.value }
                      }
                      update('listItems', newItems)
                    }}
                    className="input-field w-full text-xs"
                    placeholder="Item title"
                  />
                  <input
                    type="text"
                    value={item.mainContent?.description || ''}
                    onChange={(e) => {
                      const newItems = [...(el.listItems || [])]
                      newItems[idx] = { 
                        ...item, 
                        mainContent: { ...item.mainContent, description: e.target.value }
                      }
                      update('listItems', newItems)
                    }}
                    className="input-field w-full text-xs"
                    placeholder="Item description"
                  />
                  <button
                    onClick={() => {
                      const newItems = (el.listItems || []).filter((_: any, i: number) => i !== idx)
                      update('listItems', newItems)
                    }}
                    className="text-red-500 hover:text-red-400 text-xs"
                  >
                    Remove Item
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )

    case 'RadioButtonsGroup':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${el.id}`}
              checked={!!el.required}
              onChange={(e) => update('required', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor={`required-${el.id}`} className="text-sm text-gray-700 font-medium">Required field</label>
          </div>
          <OptionsEditor
            options={el.options}
            onChange={(opts) => update('options', opts)}
          />
        </>
      )

    case 'TextArea':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${el.id}`}
              checked={!!el.required}
              onChange={(e) => update('required', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor={`required-${el.id}`} className="text-sm text-gray-700 font-medium">Required field</label>
          </div>
        </>
      )

    case 'Dropdown':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${el.id}`}
              checked={!!el.required}
              onChange={(e) => update('required', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor={`required-${el.id}`} className="text-sm text-gray-700 font-medium">Required field</label>
          </div>
          <OptionsEditor
            options={el.options}
            onChange={(opts) => update('options', opts)}
          />
        </>
      )

    case 'Footer':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Button Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Action</label>
            <select
              value={el.action}
              onChange={(e) => update('action', e.target.value)}
              className="input-field text-sm"
            >
              <option value="navigate">Navigate to next screen</option>
              <option value="complete">Complete flow</option>
            </select>
          </div>
          {el.action === 'navigate' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Next Screen ID</label>
              <input
                type="text"
                value={el.nextScreen ?? ''}
                onChange={(e) => update('nextScreen', e.target.value)}
                className="input-field text-sm"
                placeholder="e.g., RATE"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Payload Keys
            </label>
            <input
              type="text"
              value={el.payloadKeys.join(', ')}
              onChange={(e) => update('payloadKeys', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              className="input-field text-sm"
              placeholder="Choose_one, Leave_a_comment"
            />
            <p className="text-xs text-slate-500 mt-1">
              Comma-separated data keys
            </p>
          </div>
        </>
      )

    default:
      return null
  }
}

function OptionsEditor({ options, onChange }: { options: { id: string; title: string }[]; onChange: (v: { id: string; title: string }[]) => void }) {
  const addOption = () => {
    onChange([...options, { id: `${options.length}_Option`, title: 'New Option' }])
  }

  const updateOption = (index: number, field: 'id' | 'title', value: string) => {
    const updated = options.map((opt, i) => i === index ? { ...opt, [field]: value } : opt)
    onChange(updated)
  }

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-medium text-slate-400">Options</label>
        <button onClick={addOption} className="text-xs text-whatsapp-500 hover:text-whatsapp-400 flex items-center gap-1">
          <Plus className="w-3 h-3" />
          Add
        </button>
      </div>
      <div className="space-y-2">
        {options.map((opt, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              type="text"
              value={opt.id}
              onChange={(e) => updateOption(idx, 'id', e.target.value)}
              className="input-field flex-1 text-xs"
              placeholder="ID"
            />
            <input
              type="text"
              value={opt.title}
              onChange={(e) => updateOption(idx, 'title', e.target.value)}
              className="input-field flex-1 text-xs"
              placeholder="Title"
            />
            <button
              onClick={() => removeOption(idx)}
              className="text-red-500 hover:text-red-400 p-1"
              aria-label="Remove option"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
