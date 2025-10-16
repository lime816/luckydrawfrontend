import { useState, useCallback, useEffect } from 'react'
import { Download, Plus, Code2, MessageCircle, Send, QrCode, Globe, Library, Menu, Zap, Loader, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ScreenDesigner from './screens/ScreenDesigner'
import JsonPreviewPanel from './components/JsonPreviewPanel'
import WhatsAppPreview from './components/WhatsAppPreview'
import FlowXPPanel from './components/FlowXPPanel'
import FlowPreviewPane from './components/FlowPreviewPane'
import QRFlowInitiator from './components/QRFlowInitiator'
import WebhookSetup from './components/WebhookSetup'
import MessageLibrary from './components/MessageLibrary'
import { useFlowStore } from './state/store'
import { useMessageLibraryStore } from './state/messageLibraryStore'
import { buildFlowJson } from './utils/jsonBuilder'
import { downloadText } from './utils/fileWriter'
import { WhatsAppService } from './utils/whatsappService'
import { backendApiService } from './utils/backendApiService'
import ToastContainer from './components/ToastContainer'
import { ToastData, ToastType } from './components/Toast'

export default function FlowBuilderApp() {
  const { screens, addScreen } = useFlowStore()
  const { messages, triggers } = useMessageLibraryStore()
  
  const [showJsonPreview, setShowJsonPreview] = useState(false)
  const [showWhatsAppPreview, setShowWhatsAppPreview] = useState(false)
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [showFlowsPanel, setShowFlowsPanel] = useState(false)
  const [showFlowXP, setShowFlowXP] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('918281348343')
  const [isSending, setIsSending] = useState(false)
  const [flowName, setFlowName] = useState('Lucky Draw Registration')
  const [isCreatingFlow, setIsCreatingFlow] = useState(false)
  const [allFlows, setAllFlows] = useState<any[]>([])
  const [isLoadingFlows, setIsLoadingFlows] = useState(false)
  const [selectedFlow, setSelectedFlow] = useState<any>(null)
  const [showFlowPreview, setShowFlowPreview] = useState(false)
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
      const response = await service.getAllFlows()
      
      // WhatsApp API returns {data: [...]} format
      const flowsArray = response?.data || response || []
      console.log('Flows loaded:', flowsArray)
      
      setAllFlows(Array.isArray(flowsArray) ? flowsArray : [])
      return flowsArray
    } catch (error: any) {
      showToast('error', 'Failed to Load Flows', error.message)
      setAllFlows([])
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-md">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">WhatsApp Flow Builder</h1>
                <p className="text-xs text-gray-500">Design interactive flows for your customers</p>
              </div>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => setShowJsonPreview(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 hover:border-primary-300 hover:text-primary-700 transition-all"
              >
                <Code2 className="w-4 h-4" />
                <span className="font-medium">JSON</span>
              </button>

              <button
                onClick={() => setShowFlowXP(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 hover:border-primary-300 hover:text-primary-700 transition-all"
              >
                <Zap className="w-4 h-4" />
                <span className="font-medium">FlowXP</span>
              </button>

              <button
                onClick={() => setShowWhatsAppPreview(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 hover:border-primary-300 hover:text-primary-700 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium">Preview</span>
              </button>

              <button
                onClick={() => setShowFlowsPanel(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 hover:border-primary-300 hover:text-primary-700 transition-all"
              >
                <Download className="w-4 h-4" />
                <span className="font-medium">Flows</span>
              </button>
              
              <button
                onClick={() => setShowQRCodePanel(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 hover:border-primary-300 hover:text-primary-700 transition-all"
              >
                <QrCode className="w-4 h-4" />
                <span className="font-medium">QR</span>
              </button>

              <button
                onClick={() => setShowWebhookSetup(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 hover:border-primary-300 hover:text-primary-700 transition-all"
              >
                <Globe className="w-4 h-4" />
                <span className="font-medium">Webhooks</span>
              </button>
              
              <button
                onClick={() => setShowMessageLibrary(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-all shadow-sm"
              >
                <Library className="w-4 h-4" />
                <span className="font-medium">Messages</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2.5 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 space-y-2">
              <button
                onClick={() => { setShowJsonPreview(true); setShowMobileMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-white hover:border-primary-300 hover:text-primary-700 transition-all"
              >
                <Code2 className="w-5 h-5" />
                <span className="font-medium">JSON Preview</span>
              </button>
              <button
                onClick={() => { setShowFlowXP(true); setShowMobileMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-white hover:border-primary-300 hover:text-primary-700 transition-all"
              >
                <Zap className="w-5 h-5" />
                <span className="font-medium">FlowXP</span>
              </button>
              <button
                onClick={() => { setShowWhatsAppPreview(true); setShowMobileMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-white hover:border-primary-300 hover:text-primary-700 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">WhatsApp Preview</span>
              </button>
              <button
                onClick={() => { setShowFlowsPanel(true); setShowMobileMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-white hover:border-primary-300 hover:text-primary-700 transition-all"
              >
                <Download className="w-5 h-5" />
                <span className="font-medium">Manage Flows</span>
              </button>
              <button
                onClick={() => { setShowQRCodePanel(true); setShowMobileMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-white hover:border-primary-300 hover:text-primary-700 transition-all"
              >
                <QrCode className="w-5 h-5" />
                <span className="font-medium">QR Code</span>
              </button>
              <button
                onClick={() => { setShowWebhookSetup(true); setShowMobileMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-white hover:border-primary-300 hover:text-primary-700 transition-all"
              >
                <Globe className="w-5 h-5" />
                <span className="font-medium">Webhooks</span>
              </button>
              <button
                onClick={() => { setShowMessageLibrary(true); setShowMobileMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-sm"
              >
                <Library className="w-5 h-5" />
                <span className="font-medium">Message Library</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-[1600px] mx-auto">
          <ScreenDesigner 
            flowName={flowName}
            setFlowName={setFlowName}
            customMessage={customMessage}
            setCustomMessage={setCustomMessage}
          />
        </div>
      </main>

      {/* Modals and Panels */}
      {/* JSON Preview Modal */}
      <AnimatePresence>
        {showJsonPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setShowJsonPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-2xl max-w-4xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <JsonPreviewPanel json={buildFlowJson(screens)} onClose={() => setShowJsonPreview(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FlowXP Modal */}
      <AnimatePresence>
        {showFlowXP && (
          <FlowXPPanel 
            onClose={() => setShowFlowXP(false)} 
            availableFlows={allFlows}
            availableMessages={messages}
          />
        )}
      </AnimatePresence>

      {/* WhatsApp Preview Modal */}
      <AnimatePresence>
        {showWhatsAppPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setShowWhatsAppPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-2xl max-w-md w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <WhatsAppPreview screens={screens} onClose={() => setShowWhatsAppPreview(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <div className="flex flex-col max-h-[80vh]">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                    Manage Flows
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleGetAllFlows}
                      disabled={isLoadingFlows}
                      className="px-3 py-2 text-sm bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      {isLoadingFlows ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Refresh
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowFlowsPanel(false)}
                      className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                <div className="p-6 overflow-y-auto">
                  {isLoadingFlows ? (
                    <div className="text-center py-12">
                      <Loader className="w-12 h-12 text-primary-600 mx-auto mb-4 animate-spin" />
                      <p className="text-gray-600">Loading flows from WhatsApp...</p>
                    </div>
                  ) : allFlows && allFlows.length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 mb-4">
                        {allFlows.length} flow{allFlows.length !== 1 ? 's' : ''} available from WhatsApp Business
                      </p>
                      <div className="grid gap-4">
                        {allFlows.map((flow: any) => (
                          <div
                            key={flow.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">{flow.name}</h3>
                                <p className="text-sm text-gray-600 mb-2">ID: {flow.id}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className={`px-2 py-1 rounded-full ${
                                    flow.status === 'PUBLISHED' 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {flow.status}
                                  </span>
                                  {flow.categories && flow.categories.length > 0 && (
                                    <span>Categories: {flow.categories.join(', ')}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedFlow(flow)
                                    setShowFlowPreview(true)
                                  }}
                                  className="px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors flex items-center gap-1"
                                  title="Preview Flow"
                                >
                                  <Eye className="w-4 h-4" />
                                  Preview
                                </button>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(flow.id)
                                    showToast('success', 'Copied!', 'Flow ID copied to clipboard', 2000)
                                  }}
                                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                                >
                                  Copy ID
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveFlowId(flow.id)
                                    setShowFlowsPanel(false)
                                    showToast('success', 'Flow Selected', `${flow.name} is now active`, 3000)
                                  }}
                                  className="px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                                >
                                  Set Active
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Download className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No Flows Available</h3>
                      <p className="text-gray-500 mb-4">
                        Create flows in WhatsApp Business Manager or upload a flow JSON
                      </p>
                      <button
                        onClick={() => {
                          setShowFlowsPanel(false)
                          setShowJsonPreview(true)
                        }}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                      >
                        Create Flow JSON
                      </button>
                    </div>
                  )}
                </div>
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

      {/* Flow Preview Modal */}
      <AnimatePresence>
        {showFlowPreview && selectedFlow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
            onClick={() => {
              setShowFlowPreview(false)
              setSelectedFlow(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-2xl max-w-6xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <FlowPreviewPane 
                flowId={selectedFlow.id}
                flowName={selectedFlow.name}
                onClose={() => {
                  setShowFlowPreview(false)
                  setSelectedFlow(null)
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}
