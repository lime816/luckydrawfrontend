import { useState, useCallback, useEffect } from 'react'
import { Download, Plus, Code2, MessageCircle, Send, QrCode, Globe, Library, Menu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ScreenDesigner from './screens/ScreenDesigner'
import JsonPreviewPanel from './components/JsonPreviewPanel'
import WhatsAppPreview from './components/WhatsAppPreview'
import QRFlowInitiator from './components/QRFlowInitiator'
import WebhookSetup from './components/WebhookSetup'
import MessageLibrary from './components/MessageLibrary'
import { useFlowStore } from './state/store'
import { buildFlowJson } from './utils/jsonBuilder'
import { downloadText } from './utils/fileWriter'
import { WhatsAppService } from './utils/whatsappService'
import { backendApiService } from './utils/backendApiService'
import ToastContainer from './components/ToastContainer'
import { ToastData, ToastType } from './components/Toast'

export default function FlowBuilderApp() {
  const { screens, addScreen } = useFlowStore()
  
  const [showJsonPreview, setShowJsonPreview] = useState(false)
  const [showWhatsAppPreview, setShowWhatsAppPreview] = useState(false)
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('918281348343')
  const [isSending, setIsSending] = useState(false)
  const [flowName, setFlowName] = useState('Lucky Draw Registration')
  const [isCreatingFlow, setIsCreatingFlow] = useState(false)
  const [allFlows, setAllFlows] = useState<any[]>([])
  const [showFlowsPanel, setShowFlowsPanel] = useState(false)
  const [isLoadingFlows, setIsLoadingFlows] = useState(false)
  const [selectedFlow, setSelectedFlow] = useState<any>(null)
  const [customMessage, setCustomMessage] = useState('Please complete this form to continue with your lucky draw registration.')
  const [showFlowSelectionDialog, setShowFlowSelectionDialog] = useState(false)
  const [showQRCodePanel, setShowQRCodePanel] = useState(false)
  const [showWebhookSetup, setShowWebhookSetup] = useState(false)
  const [showMessageLibrary, setShowMessageLibrary] = useState(false)
  const [activeFlowId, setActiveFlowId] = useState<string>('')
  const [toasts, setToasts] = useState<ToastData[]>([])
  const [flowActivationMessages, setFlowActivationMessages] = useState<Record<string, string>>({})
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  const businessPhoneNumber = process.env.REACT_APP_WHATSAPP_BUSINESS_NUMBER || '15550617327'

  useEffect(() => {
    const stored = localStorage.getItem('flowActivationMessages')
    if (stored) {
      try {
        setFlowActivationMessages(JSON.parse(stored))
      } catch (error) {
        console.error('Error loading stored activation messages:', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('flowActivationMessages', JSON.stringify(flowActivationMessages))
  }, [flowActivationMessages])

  useEffect(() => {
    const loadInitialFlows = async () => {
      try {
        await handleGetAllFlows()
      } catch (error) {
        console.log('Failed to auto-load flows on startup:', error)
      }
    }
    loadInitialFlows()
  }, [])

  const showToast = useCallback((type: ToastType, title: string, message: string, duration?: number) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newToast: ToastData = { id, type, title, message, duration }
    setToasts(prev => [...prev, newToast])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const handleExport = () => {
    const json = buildFlowJson(screens)
    downloadText(JSON.stringify(json, null, 2), 'whatsapp-flow.json')
  }

  const handleCreateFlow = async () => {
    if (!flowName.trim()) {
      showToast('warning', 'Flow Name Required', 'Please enter a flow name')
      return
    }
    
    if (screens.length === 0) {
      showToast('warning', 'No Screens Found', 'Please create at least one screen before creating a flow')
      return
    }

    setIsCreatingFlow(true)
    const json = buildFlowJson(screens)
    
    try {
      const service = new WhatsAppService()
      const result = await service.createFlow(flowName, 'OTHER')
      
      if (result.success && result.flowId) {
        showToast('success', 'Flow Created!', `Flow "${flowName}" created successfully with ID: ${result.flowId}`)
        setFlowActivationMessages(prev => ({
          ...prev,
          [result.flowId]: customMessage
        }))
        await handleGetAllFlows()
      } else {
        showToast('error', 'Creation Failed', result.error || 'Failed to create flow')
      }
    } catch (error: any) {
      showToast('error', 'Error', error.message || 'An unexpected error occurred')
    } finally {
      setIsCreatingFlow(false)
    }
  }

  const handleGetAllFlows = async () => {
    setIsLoadingFlows(true)
    try {
      const service = new WhatsAppService()
      const flows = await service.getAllFlows()
      setAllFlows(flows)
      return flows
    } catch (error: any) {
      showToast('error', 'Failed to Load Flows', error.message)
      return []
    } finally {
      setIsLoadingFlows(false)
    }
  }

  const handleSendActiveFlow = async () => {
    if (!activeFlowId) {
      showToast('warning', 'No Flow Selected', 'Please select a flow to send')
      return
    }

    if (!phoneNumber.trim()) {
      showToast('warning', 'Phone Number Required', 'Please enter a phone number')
      return
    }

    const activationMessage = flowActivationMessages[activeFlowId] || customMessage

    setIsSending(true)
    try {
      // TODO: Implement sendFlow method in WhatsAppService
      showToast('info', 'Feature Coming Soon', 'Flow sending will be implemented')
      // const service = new WhatsAppService()
      // const result = await service.sendFlow(phoneNumber, activeFlowId, activationMessage)
    } catch (error: any) {
      showToast('error', 'Error', error.message || 'An unexpected error occurred')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-800">WhatsApp Flow Builder</h1>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => setShowFlowsPanel(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Library className="w-4 h-4" />
                <span>Manage Flows</span>
              </button>
              
              <button
                onClick={() => setShowQRCodePanel(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <QrCode className="w-4 h-4" />
                <span>Flow QR</span>
              </button>
              
              <button
                onClick={() => setShowWebhookSetup(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>Webhooks</span>
              </button>
              
              <button
                onClick={() => setShowMessageLibrary(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message Library</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="lg:hidden mt-3 pt-3 border-t border-gray-200 space-y-2">
              <button
                onClick={() => { setShowFlowsPanel(true); setShowMobileMenu(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <Library className="w-4 h-4" />
                <span>Manage Flows</span>
              </button>
              <button
                onClick={() => { setShowQRCodePanel(true); setShowMobileMenu(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <QrCode className="w-4 h-4" />
                <span>Flow QR</span>
              </button>
              <button
                onClick={() => { setShowWebhookSetup(true); setShowMobileMenu(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <Globe className="w-4 h-4" />
                <span>Webhooks</span>
              </button>
              <button
                onClick={() => { setShowMessageLibrary(true); setShowMobileMenu(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message Library</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        <ScreenDesigner 
          flowName={flowName}
          setFlowName={setFlowName}
          customMessage={customMessage}
          setCustomMessage={setCustomMessage}
        />
      </main>

      {/* Modals and Panels */}
      <AnimatePresence>
        {showFlowsPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setShowFlowsPanel(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-2xl max-w-6xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Manage Flows Panel Content */}
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Manage Flows</h2>
                <button
                  onClick={() => setShowFlowsPanel(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
                {/* Add flow management UI here */}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQRCodePanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setShowQRCodePanel(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-2xl max-w-4xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-white" />
                    </div>
                    WhatsApp Flow QR Code Generator
                  </h3>
                  <button
                    onClick={() => setShowQRCodePanel(false)}
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="p-6">
                  <QRFlowInitiator 
                    businessPhoneNumber={businessPhoneNumber}
                    activeFlowId={activeFlowId}
                    allFlows={allFlows}
                    flowActivationMessages={flowActivationMessages}
                    onFlowTrigger={handleSendActiveFlow}
                    onCopySuccess={() => showToast('success', 'Copied!', 'WhatsApp link copied to clipboard', 3000)}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWebhookSetup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setShowWebhookSetup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-2xl max-w-6xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    Webhook Setup & Backend Integration
                  </h3>
                  <button
                    onClick={() => setShowWebhookSetup(false)}
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="p-6">
                  <WebhookSetup flows={allFlows} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMessageLibrary && (
          <MessageLibrary 
            onClose={() => setShowMessageLibrary(false)}
          />
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}
