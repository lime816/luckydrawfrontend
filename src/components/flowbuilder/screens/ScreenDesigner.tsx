import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, X, Menu, Plus } from 'lucide-react'
import Palette from '../components/Palette'
import Canvas from '../components/Canvas'
import ScreenSettings from '../components/ScreenSettings'
import { useFlowStore } from '../state/store'

interface ScreenDesignerProps {
  flowName: string
  setFlowName: (name: string) => void
  customMessage: string
  setCustomMessage: (message: string) => void
}

export default function ScreenDesigner({ flowName, setFlowName, customMessage, setCustomMessage }: ScreenDesignerProps) {
  const { screens, selectedScreenId, selectScreen, removeScreen, addScreen } = useFlowStore()
  const [showMobilePalette, setShowMobilePalette] = useState(false)
  
  return (
    <div className="relative">
      {/* Components Hamburger Menu Button - Always visible */}
      <button
        onClick={() => setShowMobilePalette(!showMobilePalette)}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
        title="Toggle Components Menu"
      >
        {showMobilePalette ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Components Palette - Hamburger Menu */}
      <AnimatePresence>
        {showMobilePalette && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobilePalette(false)}
              className="fixed inset-0 bg-black/50 z-[55]"
            />
            
            {/* Palette Sidebar */}
            <motion.aside 
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] sm:max-w-sm bg-white shadow-2xl z-[60] overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Layers className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Components</h3>
                      <p className="text-xs text-gray-500">Drag & drop to canvas</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMobilePalette(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Screens Section */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Screens</h4>
                  <div className="flex flex-wrap gap-2">
                    {screens.map((s, idx) => (
                      <motion.div
                        key={s.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`screen-tab group ${
                          s.id === selectedScreenId ? 'screen-tab-active' : 'screen-tab-inactive'
                        } relative`}
                      >
                        <button
                          onClick={() => selectScreen(s.id)}
                          className="flex-1 text-left pr-8"
                        >
                          {s.id}
                        </button>
                        {screens.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeScreen(s.id)
                            }}
                            className="absolute right-1 top-1/2 -translate-y-1/2 p-1 hover:bg-red-500 hover:text-white text-red-400 rounded transition-all"
                            title="Delete screen"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                    
                    {/* Add Screen Button */}
                    <motion.button
                      onClick={addScreen}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: screens.length * 0.05 }}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                      title="Add new screen"
                    >
                      <Plus className="w-4 h-4" />
                      Add Screen
                    </motion.button>
                  </div>
                </div>

                {/* Palette */}
                <Palette />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Layout - Canvas and Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 h-full"
>

        {/* Main Canvas - Wider */}
        <motion.main 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-8 min-h-[400px]"
        >
          <AnimatePresence mode="wait">
            <Canvas key={selectedScreenId} />
          </AnimatePresence>
        </motion.main>

        {/* Right Sidebar - Screen Settings - Closer */}
        <motion.aside
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-4 h-full min-h-[500px]"
        >
          <div className="glass-panel h-full overflow-hidden">
            <ScreenSettings 
              flowName={flowName}
              setFlowName={setFlowName}
              customMessage={customMessage}
              setCustomMessage={setCustomMessage}
            />
          </div>
        </motion.aside>
      </div>
    </div>
  )
}
