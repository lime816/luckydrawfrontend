import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input, TextArea } from '../common/Input';
import { Contest, ContestStatus, Prize } from '../../types';
import { Plus, Trash2 } from 'lucide-react';

interface ContestFormProps {
  contest: Contest | null;
  onSave: (contest: Partial<Contest>) => void;
  onCancel: () => void;
}

export const ContestForm: React.FC<ContestFormProps> = ({ contest, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: contest?.name || '',
    theme: contest?.theme || '',
    description: contest?.description || '',
    startTime: contest?.startTime || '',
    endTime: contest?.endTime || '',
    status: contest?.status || ContestStatus.DRAFT,
    entryRules: contest?.entryRules || 'one entry',
    participationMethod: contest?.participationMethod || [],
  });

  const [prizes, setPrizes] = useState<Prize[]>(contest?.prizes || []);
  const [newPrize, setNewPrize] = useState({ name: '', value: '', quantity: '' });
  const [timeError, setTimeError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate times
    if (name === 'startTime' || name === 'endTime') {
      const startTime = name === 'startTime' ? value : formData.startTime;
      const endTime = name === 'endTime' ? value : formData.endTime;
      
      if (startTime && endTime) {
        // Create datetime objects for comparison
        const startDateTime = new Date(startTime);
        const endDateTime = new Date(endTime);
        
        if (endDateTime <= startDateTime) {
          setTimeError('Lucky Draw End Time must be after Start Time');
        } else {
          setTimeError('');
        }
      } else {
        setTimeError('');
      }
    }
  };

  const handleAddPrize = () => {
    if (newPrize.name && newPrize.value && newPrize.quantity) {
      setPrizes([
        ...prizes,
        {
          id: Date.now().toString(),
          name: newPrize.name,
          value: parseFloat(newPrize.value),
          quantity: parseInt(newPrize.quantity),
        },
      ]);
      setNewPrize({ name: '', value: '', quantity: '' });
    }
  };

  const handleRemovePrize = (id: string) => {
    setPrizes(prizes.filter((p) => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate times before submission
    if (formData.startTime && formData.endTime) {
      const startDateTime = new Date(formData.startTime);
      const endDateTime = new Date(formData.endTime);
      
      if (endDateTime <= startDateTime) {
        setTimeError('Lucky Draw End Time must be after Start Time');
        return;
      }
    }
    
    // Ensure required fields are present
    if (!formData.startTime || !formData.endTime) {
      setTimeError('Both Start Time and End Time are required');
      return;
    }
    
    onSave({ ...formData, prizes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Contest Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Theme"
            name="theme"
            value={formData.theme}
            onChange={handleChange}
            required
          />
        </div>
        <TextArea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          required
        />
      </div>

      {/* Lucky Draw Schedule & Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Lucky Draw Schedule</h3>
        <p className="text-sm text-gray-600">Specify the exact time window when the lucky draw will be active</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Lucky Draw Start Time"
            name="startTime"
            type="datetime-local"
            value={formData.startTime}
            onChange={handleChange}
            placeholder="Select start time"
            required
          />
          <Input
            label="Lucky Draw End Time"
            name="endTime"
            type="datetime-local"
            value={formData.endTime}
            onChange={handleChange}
            placeholder="Select end time"
            required
          />
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contest Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value={ContestStatus.DRAFT}>Draft</option>
              <option value={ContestStatus.UPCOMING}>Upcoming</option>
              <option value={ContestStatus.ONGOING}>Ongoing</option>
              <option value={ContestStatus.COMPLETED}>Completed</option>
              <option value={ContestStatus.CANCELLED}>Cancelled</option>
            </select>
          </div> */}
        </div>
        {timeError && (
          <p className="text-sm text-red-600 font-medium">{timeError}</p>
        )}
      </div>

      {/* Entry Rules */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Entry Rules</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Entry Type</label>
          <select
            name="entryRules"
            value={formData.entryRules}
            onChange={handleChange}
            className="input-field"
            required
          >
            <option value="one entry">One Entry</option>
            <option value="multiple entry">Multiple Entry</option>
          </select>
        </div>
      </div>

      {/* Prizes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Prizes</h3>
        
        {/* Existing Prizes */}
        {prizes.length > 0 && (
          <div className="space-y-2">
            {prizes.map((prize) => (
              <div
                key={prize.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{prize.name}</p>
                  <p className="text-sm text-gray-600">
                    Value: ₹{prize.value.toLocaleString()} | Quantity: {prize.quantity}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePrize(prize.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Prize */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Prize name"
            value={newPrize.name}
            onChange={(e) => setNewPrize({ ...newPrize, name: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Value (₹)"
            value={newPrize.value}
            onChange={(e) => setNewPrize({ ...newPrize, value: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Quantity"
            value={newPrize.quantity}
            onChange={(e) => setNewPrize({ ...newPrize, quantity: e.target.value })}
          />
          <Button
            type="button"
            variant="secondary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAddPrize}
            className="w-full"
          >
            Add Prize
          </Button>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel} className="w-full sm:w-auto order-2 sm:order-1">
          Cancel
        </Button>
        <Button type="submit" variant="primary" className="w-full sm:w-auto order-1 sm:order-2">
          {contest ? 'Update Contest' : 'Create Contest'}
        </Button>
      </div>
    </form>
  );
};
