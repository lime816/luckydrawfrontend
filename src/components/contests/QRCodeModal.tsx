import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Download, Copy, Check, RefreshCw } from 'lucide-react';
import QRCode from 'qrcode';
import { Contest } from '../../types';
import toast from 'react-hot-toast';
import { DatabaseService } from '../../services/database';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  contest: Contest;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, contest }) => {
  const [copied, setCopied] = useState(false);

  // Generate WhatsApp link if available
  const generateWhatsAppLink = () => {
    if (contest.whatsappNumber && contest.whatsappMessage) {
      return `https://wa.me/${contest.whatsappNumber}?text=${encodeURIComponent(contest.whatsappMessage)}`;
    }
    return null;
  };

  // The desired target for the QR code. Priority: WhatsApp link > qrCodeUrl > fallback
  const whatsappLink = generateWhatsAppLink();
  const catImageUrl = 'https://hips.hearstapps.com/hmg-prod/images/cutest-cat-breeds-ragdoll-663a8c6d52172.jpg?crop=0.5989005497251375xw:1xh;center,top&resize=980:*';
  const initialTarget = whatsappLink || contest.qrCodeUrl || catImageUrl;

  // Editable target URL so users can paste a new link
  const [editableUrl, setEditableUrl] = useState<string>(initialTarget);

  // Generate a QR data URL (PNG) that encodes `editableUrl` and display it in the modal.
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [generating, setGenerating] = useState(false);

  // Keep editableUrl in sync when modal opens / contest changes
  useEffect(() => {
    if (isOpen) {
      const link = generateWhatsAppLink();
      setEditableUrl(link || contest.qrCodeUrl || catImageUrl);
    }
  }, [isOpen, contest.qrCodeUrl, contest.whatsappNumber, contest.whatsappMessage]);

  // Auto-generate QR code whenever the editable URL changes
  useEffect(() => {
    let cancelled = false;
    const gen = async () => {
      try {
        setGenerating(true);
        const dataUrl = await QRCode.toDataURL(editableUrl, { width: 512, margin: 2 });
        if (!cancelled) setQrDataUrl(dataUrl);
      } catch (err) {
        console.error('Failed to generate QR code:', err);
        if (!cancelled) setQrDataUrl('');
      } finally {
        if (!cancelled) setGenerating(false);
      }
    };
    gen();
    return () => { cancelled = true; };
  }, [editableUrl]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(editableUrl);
    setCopied(true);
    toast.success('URL copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerateQRCode = async () => {
    try {
      setGenerating(true);
      // Basic URL validation
      try {
        // will throw if invalid
        // eslint-disable-next-line no-new
        new URL(editableUrl);
      } catch (validationErr) {
        toast.error('Please enter a valid URL');
        return;
      }

      const dataUrl = await QRCode.toDataURL(editableUrl, { width: 512, margin: 2 });
      setQrDataUrl(dataUrl);

      // Persist the new QR target URL to the contest record (Supabase)
      try {
        // contest.id is a string in the UI models; the database expects a number
        await DatabaseService.updateContest(parseInt(contest.id), { qr_code_url: editableUrl });
        // Use a fixed toast id so duplicate calls don't show multiple toasts
        toast.success('QR code regenerated and saved', { id: 'qr-regenerated' });
      } catch (dbErr) {
        console.error('Failed to save QR target URL:', dbErr);
        toast.error('QR regenerated but failed to save target URL');
      }
    } catch (err) {
      console.error('Failed to regenerate QR code:', err);
      toast.error('Failed to regenerate QR code');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadQR = async () => {
    try {
      if (!qrDataUrl) {
        toast.error('QR code not generated yet');
        return;
      }

      const res = await fetch(qrDataUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${contest.name.replace(/\s+/g, '-')}-QRCode.png`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('QR Code downloaded!');
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Failed to download QR code');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Contest QR Code"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" icon={<Download className="w-4 h-4" />} onClick={handleDownloadQR}>
            Download QR Code
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Contest Info */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{contest.name}</h3>
          <p className="text-sm text-gray-600">{contest.theme}</p>
        </div>

        {/* QR Code (generated from the target URL) */}
        <div className="flex justify-center p-6 bg-white border-2 border-gray-200 rounded-lg">
          {generating ? (
            <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg">
              <p className="text-gray-500">Generating QR code...</p>
            </div>
          ) : qrDataUrl ? (
            <img src={qrDataUrl} alt="Contest QR Code" className="w-64 h-64 object-contain" />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg">
              <p className="text-gray-500">QR Code not available</p>
            </div>
          )}
        </div>

        {/* WhatsApp Indicator */}
        {whatsappLink && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <span className="text-2xl">💬</span>
            <div>
              <p className="text-sm font-semibold text-green-800">WhatsApp QR Code</p>
              <p className="text-xs text-green-600">Participants will be directed to WhatsApp</p>
            </div>
          </div>
        )}

        {/* URL Display */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            QR Code Target URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={editableUrl}
              onChange={(e) => setEditableUrl(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm"
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                onClick={handleCopyUrl}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={regenerateQRCode}
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">How to use:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Share this QR code on posters, flyers, or digital media</li>
            <li>• Participants can scan to enter the contest</li>
            <li>• Download the QR code for printing</li>
            <li>• Copy the URL to share digitally</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};
