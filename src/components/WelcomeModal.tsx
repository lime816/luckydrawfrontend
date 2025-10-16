import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';

interface WelcomeModalProps {
  username: string;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ username, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-close after 3 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
          style={{ minWidth: '300px', maxWidth: '400px' }}
        >
          {/* Progress bar at top */}
          <div className="h-1 bg-gray-200">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 3, ease: 'linear' }}
              className="h-full bg-green-500"
            />
          </div>

          {/* Content */}
          <div className="p-4 flex items-start gap-3">
            {/* Success icon */}
            <div className="flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>

            {/* Message */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                Welcome back, {username}! 👋
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Logged in successfully
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
