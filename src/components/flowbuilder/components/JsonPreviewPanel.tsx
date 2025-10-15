import React from 'react'
import { motion } from 'framer-motion'
import { X, Copy, Check } from 'lucide-react'

interface JsonPreviewPanelProps {
  json: any
  onClose: () => void
}

export default function JsonPreviewPanel({ json, onClose }: JsonPreviewPanelProps) {
  const [copied, setCopied] = React.useState(false)
  const jsonString = JSON.stringify(json, null, 2)

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full md:w-2/3 lg:w-1/2 bg-white border-l border-gray-200 shadow-2xl z-[9999] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">JSON Preview</h2>
            <p className="text-sm text-gray-600">WhatsApp Flow API v7.2</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-primary-300 transition-all shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              <span className="font-medium">{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* JSON Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <pre className="bg-white border border-gray-200 rounded-xl p-6 text-sm overflow-x-auto shadow-sm font-mono text-gray-800">
            <code>{jsonString}</code>
          </pre>
        </div>
      </motion.div>
    </>
  )
}
