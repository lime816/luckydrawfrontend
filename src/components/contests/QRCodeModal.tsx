import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Download, Copy, Check, RefreshCw } from 'lucide-react';
import QRCode from 'qrcode';
import { Contest } from '../../types';
import toast from 'react-hot-toast';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  contest: Contest;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, contest }) => {
  const [copied, setCopied] = useState(false);

  // The desired target for the QR code. If contest.qrCodeUrl is set, use that; otherwise fall back to the cat image.
  const catImageUrl = 'https://hips.hearstapps.com/hmg-prod/images/cutest-cat-breeds-ragdoll-663a8c6d52172.jpg?crop=0.5989005497251375xw:1xh;center,top&resize=980:*';
  const initialTarget = contest.qrCodeUrl || catImageUrl;

  // Editable target URL so users can paste a new link
  const [editableUrl, setEditableUrl] = useState<string>(initialTarget);

  // Generate a QR data URL (PNG) that encodes `editableUrl` and display it in the modal.
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [generating, setGenerating] = useState(false);

  // Keep editableUrl in sync when modal opens / contest changes
  useEffect(() => {
    if (isOpen) setEditableUrl(contest.qrCodeUrl || catImageUrl);
  }, [isOpen, contest.qrCodeUrl]);

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
      const dataUrl = await QRCode.toDataURL(editableUrl, { width: 512, margin: 2 });
      setQrDataUrl(dataUrl);
      toast.success('QR code regenerated');
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
