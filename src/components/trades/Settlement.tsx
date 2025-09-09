import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { DollarSign, Plus } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../utils/storage';
import { Trade, Merchant, SettlementType } from '../../types';
import { generateId, formatCurrency } from '../../utils/calculations';

interface SettlementFormData {
  merchantId: string;
  settlementType: SettlementType;
  amount: number;
  weight?: number;
  notes?: string;
}

export const Settlement: React.FC = () => {
  const [merchants, setMerchants] = useLocalStorage<Merchant[]>(STORAGE_KEYS.MERCHANTS, []);
  const [trades, setTrades] = useLocalStorage<Trade[]>(STORAGE_KEYS.TRADES, []);
  const [showAddMerchant, setShowAddMerchant] = useState(false);
  const [newMerchant, setNewMerchant] = useState({ name: '', phone: '', email: '' });
  
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<SettlementFormData>({
    defaultValues: {
      settlementType: 'cash',
    }
  });

  const watchedValues = watch();

  const onSubmit = (data: SettlementFormData) => {
    const selectedMerchant = merchants.find(m => m.id === data.merchantId);
    if (!selectedMerchant) return;

    const newTrade: Trade = {
      id: generateId(),
      type: 'settlement',
      merchantId: data.merchantId,
      merchantName: selectedMerchant.name,
      totalAmount: data.amount,
      settlementType: data.settlementType,
      weight: data.weight,
      notes: data.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTrades([...trades, newTrade]);
    reset();
    
    alert('Settlement recorded successfully!');
  };

  const addMerchant = () => {
    if (!newMerchant.name.trim()) return;

    const merchant: Merchant = {
      id: generateId(),
      name: newMerchant.name,
      phone: newMerchant.phone,
      email: newMerchant.email,
      totalDue: 0,
      totalOwe: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setMerchants([...merchants, merchant]);
    setNewMerchant({ name: '', phone: '', email: '' });
    setShowAddMerchant(false);
  };

  const merchantOptions = [
    { value: '', label: 'Select Merchant' },
    ...merchants.map(merchant => ({
      value: merchant.id,
      label: merchant.name
    }))
  ];

  const settlementOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank', label: 'Bank Transfer' },
    { value: 'gold', label: 'Gold' },
    { value: 'silver', label: 'Silver' },
  ];

  const isMetalSettlement = watchedValues.settlementType === 'gold' || watchedValues.settlementType === 'silver';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-3"
      >
        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Settlement</h1>
          <p className="text-gray-400">Record due settlements</p>
        </div>
      </motion.div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Select
                label="Merchant"
                options={merchantOptions}
                {...register('merchantId', { required: 'Please select a merchant' })}
                error={errors.merchantId?.message}
              />
            </div>
            <Button
              type="button"
              onClick={() => setShowAddMerchant(true)}
              variant="outline"
              className="mt-6"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <Select
            label="Settlement Type"
            options={settlementOptions}
            {...register('settlementType')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={isMetalSettlement ? 'Value Amount' : 'Amount'}
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount', { 
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0' }
              })}
              error={errors.amount?.message}
            />
            {isMetalSettlement && (
              <Input
                label={`Weight (${watchedValues.settlementType === 'gold' ? 'grams' : 'kg'})`}
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('weight', { 
                  required: 'Weight is required for metal settlement',
                  min: { value: 0.01, message: 'Weight must be greater than 0' }
                })}
                error={errors.weight?.message}
              />
            )}
          </div>

          {watchedValues.amount > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-700 p-4 rounded-lg space-y-2"
            >
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Settlement Type:</span>
                <span className="text-white capitalize">{watchedValues.settlementType}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Amount:</span>
                <span className="text-white">{formatCurrency(watchedValues.amount)}</span>
              </div>
              {isMetalSettlement && watchedValues.weight && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">Weight:</span>
                  <span className="text-white">
                    {watchedValues.weight} {watchedValues.settlementType === 'gold' ? 'g' : 'kg'}
                  </span>
                </div>
              )}
            </motion.div>
          )}

          <Input
            label="Notes (Optional)"
            placeholder="Add any additional notes"
            {...register('notes')}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={!watchedValues.merchantId || !watchedValues.amount || (isMetalSettlement && !watchedValues.weight)}
          >
            Record Settlement
          </Button>
        </form>
      </Card>

      <Modal
        isOpen={showAddMerchant}
        onClose={() => setShowAddMerchant(false)}
        title="Add New Merchant"
      >
        <div className="space-y-4">
          <Input
            label="Merchant Name"
            placeholder="Enter merchant name"
            value={newMerchant.name}
            onChange={(e) => setNewMerchant({ ...newMerchant, name: e.target.value })}
            required
          />
          <Input
            label="Phone Number (Optional)"
            placeholder="Enter phone number"
            value={newMerchant.phone}
            onChange={(e) => setNewMerchant({ ...newMerchant, phone: e.target.value })}
          />
          <Input
            label="Email (Optional)"
            type="email"
            placeholder="Enter email"
            value={newMerchant.email}
            onChange={(e) => setNewMerchant({ ...newMerchant, email: e.target.value })}
          />
          <Button onClick={addMerchant} className="w-full">
            Add Merchant
          </Button>
        </div>
      </Modal>
    </div>
  );
};