import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, GripVertical, Eye, Send, MessageSquare, Workflow } from 'lucide-react'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface FlowXPPanelProps {
  onClose: () => void
}

interface MessageStep {
  id: string
  type: 'flow' | 'message'
  name: string
  content: string
  delay?: number // delay in seconds before sending
}

function SortableMessageStep({ step, onRemove, onEdit }: { step: MessageStep; onRemove: () => void; onEdit: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-all"
    >
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {step.type === 'flow' ? (
              <Workflow className="w-4 h-4 text-primary-600" />
            ) : (
              <MessageSquare className="w-4 h-4 text-green-600" />
            )}
            <span className="text-xs font-semibold text-gray-500 uppercase">
              {step.type === 'flow' ? 'WhatsApp Flow' : 'Message'}
            </span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">{step.name}</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{step.content}</p>
          {step.delay && step.delay > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              ⏱️ Delay: {step.delay}s after previous message
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={onRemove}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FlowXPPanel({ onClose }: FlowXPPanelProps) {
  const [messageSteps, setMessageSteps] = useState<MessageStep[]>([
    {
      id: '1',
      type: 'message',
      name: 'Welcome Message',
      content: 'Welcome to our Lucky Draw! 🎉',
      delay: 0
    },
    {
      id: '2',
      type: 'flow',
      name: 'Registration Flow',
      content: 'Lucky Draw Registration Form',
      delay: 2
    }
  ])
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = messageSteps.findIndex(s => s.id === active.id)
    const newIndex = messageSteps.findIndex(s => s.id === over.id)

    const newSteps = [...messageSteps]
    const [movedItem] = newSteps.splice(oldIndex, 1)
    newSteps.splice(newIndex, 0, movedItem)
    setMessageSteps(newSteps)
  }

  const addMessageStep = (type: 'flow' | 'message') => {
    const newStep: MessageStep = {
      id: Date.now().toString(),
      type,
      name: type === 'flow' ? 'New Flow' : 'New Message',
      content: type === 'flow' ? 'Flow description' : 'Message content',
      delay: 0
    }
    setMessageSteps([...messageSteps, newStep])
    setShowAddMenu(false)
  }

  const removeStep = (id: string) => {
    setMessageSteps(messageSteps.filter(s => s.id !== id))
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
            <h2 className="text-xl font-bold text-gray-900">Flow Experience (FlowXP)</h2>
            <p className="text-sm text-gray-600">Configure message sending sequence</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-primary-300 transition-all shadow-sm"
            >
              <Eye className="w-4 h-4" />
              <span className="font-medium">{showPreview ? 'Hide' : 'Show'} Preview</span>
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

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Message Sequence Builder */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Message Sequence</h3>
                <div className="relative">
                  <button
                    onClick={() => setShowAddMenu(!showAddMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="font-medium">Add Step</span>
                  </button>

                  {showAddMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10">
                      <button
                        onClick={() => addMessageStep('message')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Add Message</span>
                      </button>
                      <button
                        onClick={() => addMessageStep('flow')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Workflow className="w-4 h-4 text-primary-600" />
                        <span className="text-sm font-medium">Add Flow</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={messageSteps.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {messageSteps.map((step, index) => (
                      <div key={step.id}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <div className="h-px flex-1 bg-gray-200"></div>
                        </div>
                        <SortableMessageStep
                          step={step}
                          onRemove={() => removeStep(step.id)}
                          onEdit={() => {}}
                        />
                      </div>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {messageSteps.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <Send className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No messages added yet</p>
                  <p className="text-sm text-gray-500">Click "Add Step" to get started</p>
                </div>
              )}
            </div>

            {/* Preview Panel */}
            {showPreview && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">WhatsApp Preview</h3>
                <div className="bg-gradient-to-b from-gray-200 to-gray-300 rounded-xl p-4 shadow-inner">
                  <div className="bg-[#e5ddd5] rounded-lg p-4 min-h-[500px] max-h-[600px] overflow-y-auto">
                    {messageSteps.map((step, index) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className="mb-3"
                      >
                        <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm max-w-[80%]">
                          <div className="flex items-center gap-2 mb-1">
                            {step.type === 'flow' ? (
                              <Workflow className="w-3 h-3 text-primary-600" />
                            ) : (
                              <MessageSquare className="w-3 h-3 text-green-600" />
                            )}
                            <span className="text-xs font-semibold text-gray-500">
                              {step.type === 'flow' ? 'Interactive Flow' : 'Message'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900">{step.content}</p>
                          {step.type === 'flow' && (
                            <button className="mt-2 w-full bg-primary-600 text-white py-2 px-4 rounded-lg text-sm font-medium">
                              Open {step.name}
                            </button>
                          )}
                          <div className="text-xs text-gray-400 mt-1 text-right">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{messageSteps.length}</span> message{messageSteps.length !== 1 ? 's' : ''} in sequence
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-md font-medium"
              >
                Save Sequence
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
