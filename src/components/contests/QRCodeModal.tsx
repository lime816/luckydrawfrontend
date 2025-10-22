import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Download, Copy, Check } from 'lucide-react';
import { Contest } from '../../types';
import toast from 'react-hot-toast';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  contest: Contest;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, contest }) => {
  const [copied, setCopied] = useState(false);

  // Use the QR code URL from backend (the image stored in Supabase Storage)
  const qrCodeImageUrl = contest.qrCodeUrl || '';

  // The URL that the QR code points to (fallback to cat image when QR not generated)
  const catImageUrl = 'https://hips.hearstapps.com/hmg-prod/images/cutest-cat-breeds-ragdoll-663a8c6d52172.jpg?crop=0.5989005497251375xw:1xh;center,top&resize=980:*';
  const targetUrl = catImageUrl;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    toast.success('URL copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = async () => {
    try {
      // Prefer downloading the stored QR image; if missing, download the fallback image
      const downloadUrl = qrCodeImageUrl || catImageUrl;
      const response = await fetch(downloadUrl);
      const blob = await response.blob();

      // Create download link
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

        {/* QR Code or fallback (cat image) */}
        <div className="flex justify-center p-6 bg-white border-2 border-gray-200 rounded-lg">
          <img
            src={qrCodeImageUrl || catImageUrl}
            alt="Contest QR Code"
            className="w-64 h-64 object-contain"
            onError={(e) => {
              // If image fails to load, show a simple placeholder
              const el = e.currentTarget as HTMLImageElement;
              el.style.display = 'none';
              (el.parentElement as HTMLElement).innerHTML = '<div class="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg"><p class="text-gray-500">QR Code not available</p></div>';
            }}
          />
        </div>

        {/* URL Display */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            QR Code Target URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={targetUrl}
              readOnly
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
            />
            <Button
              variant="secondary"
              size="sm"
              icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              onClick={handleCopyUrl}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
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
