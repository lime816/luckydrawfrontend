import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Users, Clock, Loader } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input, TextArea } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { formatDate } from '../utils/helpers';
import { MessageService, Message as DBMessage } from '../services/messageService';
import { SupabaseService, Contest } from '../lib/supabase-db';
import toast from 'react-hot-toast';

export const Communication: React.FC = () => {
  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageStats, setMessageStats] = useState({
    total: 0,
    email: 0,
    sms: 0,
    whatsapp: 0,
  });

  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send');
  const [messageForm, setMessageForm] = useState({
    type: 'WHATSAPP' as 'EMAIL' | 'SMS' | 'WHATSAPP',
    contest_id: '',
    recipient: '',
    content: '',
    is_bulk: false,
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [messagesData, contestsData, statsData] = await Promise.all([
        MessageService.getAllMessages(),
        SupabaseService.getAllContests(),
        MessageService.getMessageStats(),
      ]);
      
      setMessages(messagesData);
      setContests(contestsData);
      setMessageStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageForm.contest_id || !messageForm.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSending(true);
      
      if (messageForm.is_bulk) {
        // Send bulk message to all participants
        await MessageService.sendBulkMessage(
          parseInt(messageForm.contest_id),
          messageForm.type,
          messageForm.content,
          1 // TODO: Get actual admin ID from auth context
        );
        toast.success('Bulk message sent successfully!');
      } else {
        // Send individual message
        if (!messageForm.recipient) {
          toast.error('Please enter recipient for individual message');
          return;
        }
        
        await MessageService.sendMessage({
          contest_id: parseInt(messageForm.contest_id),
          type: messageForm.type,
          recipient: messageForm.recipient,
          content: messageForm.content,
          sent_by: 1, // TODO: Get actual admin ID from auth context
        });
        toast.success('Message sent successfully!');
      }

      // Reset form and reload data
      setMessageForm({
        type: 'WHATSAPP',
        contest_id: '',
        recipient: '',
        content: '',
        is_bulk: false,
      });
      setSelectedTemplate('');
      await loadData();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getTypeBadge = (type: 'EMAIL' | 'SMS' | 'WHATSAPP') => {
    const variants: Record<string, 'success' | 'warning' | 'info'> = {
      EMAIL: 'info',
      SMS: 'warning',
      WHATSAPP: 'success',
    };
    return <Badge variant={variants[type]}>{type}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Loading messages...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Communication</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Send messages and notifications to participants</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{messageStats.total}</p>
              <p className="text-sm text-gray-600">Total Messages</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{messageStats.whatsapp}</p>
              <p className="text-sm text-gray-600">WhatsApp</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('send')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'send'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Send Message
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Message History
        </button>
      </div>

      {/* Content */}
      {activeTab === 'send' ? (
        <Card title="Send Message">
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message Type</label>
                {/* Message type is fixed to WhatsApp only */}
                <select
                  value={messageForm.type}
                  onChange={() => { /* no-op, fixed to WhatsApp */ }}
                  className="input-field"
                  disabled
                >
                  <option value="WHATSAPP">WhatsApp</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contest</label>
                <select
                  value={messageForm.contest_id}
                  onChange={(e) => setMessageForm({ ...messageForm, contest_id: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select Contest</option>
                  {contests.map((contest) => (
                    <option key={contest.contest_id} value={contest.contest_id}>
                      {contest.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Templates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
              <select
                value={selectedTemplate}
                onChange={(e) => {
                  const t = e.target.value;
                  setSelectedTemplate(t);
                  let tpl = '';
                  if (t === 'WINNER') tpl = 'Congratulations {{name}}! You have won {{prize}}. Reply to claim.';
                  else if (t === 'WELCOME') tpl = 'Welcome {{name}} to the contest {{contest_name}}! Good luck.';
                  else if (t === 'UPDATES') tpl = 'Update: {{contest_name}} schedule has changed. Check the dashboard for details.';
                  else tpl = '';
                  setMessageForm({ ...messageForm, content: tpl });
                }}
                className="input-field"
              >
                <option value="">-- Select Template (optional) --</option>
                <option value="WINNER">Winner</option>
                <option value="WELCOME">Welcome</option>
                <option value="UPDATES">Updates</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">You can use placeholders like <code className="bg-gray-100 px-1 rounded">{'{{name}}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{{prize}}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{{contest_name}}'}</code>.</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_bulk"
                checked={messageForm.is_bulk}
                onChange={(e) => setMessageForm({ ...messageForm, is_bulk: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="is_bulk" className="text-sm text-gray-700">
                Send to all participants in contest
              </label>
            </div>

            {!messageForm.is_bulk && (
              <Input
                label="Recipient"
                value={messageForm.recipient}
                onChange={(e) => setMessageForm({ ...messageForm, recipient: e.target.value })}
                placeholder="Enter email, phone number, or WhatsApp number"
                required={!messageForm.is_bulk}
              />
            )}

            <TextArea
              label="Message Content"
              value={messageForm.content}
              onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
              rows={6}
              required
              placeholder="Enter your message content..."
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setMessageForm({
                    type: 'WHATSAPP',
                    contest_id: '',
                    recipient: '',
                    content: '',
                    is_bulk: false,
                  });
                  setSelectedTemplate('');
                }}
              >
                Clear
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                icon={<Send className="w-5 h-5" />}
                disabled={sending}
              >
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card title="Message History">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No messages sent yet
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.message_id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeBadge(message.type)}
                      <Badge variant="info" size="sm">
                        Contest #{message.contest_id}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(message.sent_at, 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  <div className="mb-2">
                    <p className="font-medium text-gray-900">To: {message.recipient}</p>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{message.content}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Sent by: Admin #{message.sent_by}</span>
                    <span>{message.is_auto ? 'Automated' : 'Manual'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Communication;
