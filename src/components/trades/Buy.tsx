import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { ShoppingCart, Plus } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../utils/storage';
import { Trade, Merchant, MetalType, PaymentType } from '../../types';
import { generateId, formatCurrency } from '../../utils/calculations';

interface BuyFormData {
  merchantId: string;
  metalType: MetalType;
  weight: number;
  pricePerUnit: number;
  amountPaid: number;
  paymentType: PaymentType;
  notes?: string;
}

export const Buy: React.FC = () => {
  const [merchants, setMerchants] = useLocalStorage<Merchant[]>(STORAGE_KEYS.MERCHANTS, []);
  const [trades, setTrades] = useLocalStorage<Trade[]>(STORAGE_KEYS.TRADES, []);
  const [showAddMerchant, setShowAddMerchant] = useState(false);
  const [newMerchant, setNewMerchant] = useState({ name: '', phone: '', email: '' });
  
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<BuyFormData>({
    defaultValues: {
      metalType: 'gold',
      paymentType: 'cash',
    }
  });

  const watchedValues = watch();
  const totalAmount = (watchedValues.weight || 0) * (watchedValues.pricePerUnit || 0);
  const remainingAmount = totalAmount - (watchedValues.amountPaid || 0);

  const onSubmit = (data: BuyFormData) => {
    const selectedMerchant = merchants.find(m => m.id === data.merchantId);
    if (!selectedMerchant) return;

    const newTrade: Trade = {
      id: generateId(),
      type: 'buy',
      merchantId: data.merchantId,
      merchantName: selectedMerchant.name,
      metalType: data.metalType,
      weight: data.weight,
      pricePerUnit: data.pricePerUnit,
      totalAmount,
      amountPaid: data.amountPaid,
      paymentType: data.paymentType,
      notes: data.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTrades([...trades, newTrade]);
    reset();
    
    // Show success message (in real app, use toast)
    alert('Purchase recorded successfully!');
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

  const metalOptions = [
    { value: 'gold', label: 'Gold' },
    { value: 'silver', label: 'Silver' },
  ];

  const paymentOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-3"
      >
        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
          <ShoppingCart className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Buy Transaction</h1>
          <p className="text-gray-400">Record a purchase from merchant</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Metal Type"
              options={metalOptions}
              {...register('metalType')}
            />
            <Select
              label="Payment Type"
              options={paymentOptions}
              {...register('paymentType')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={`Weight (${watchedValues.metalType === 'gold' ? 'grams' : 'kg'})`}
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('weight', { 
                required: 'Weight is required',
                min: { value: 0.01, message: 'Weight must be greater than 0' }
              })}
              error={errors.weight?.message}
            />
            <Input
              label={`Price per ${watchedValues.metalType === 'gold' ? '10g' : 'kg'}`}
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('pricePerUnit', { 
                required: 'Price is required',
                min: { value: 0.01, message: 'Price must be greater than 0' }
              })}
              error={errors.pricePerUnit?.message}
            />
          </div>

          {totalAmount > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-700 p-4 rounded-lg"
            >
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-gray-300">Total Amount:</span>
                <span className="text-white font-medium">{formatCurrency(totalAmount)}</span>
              </div>
            </motion.div>
          )}

          <Input
            label="Amount Paid"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('amountPaid', { 
              required: 'Amount paid is required',
              min: { value: 0, message: 'Amount cannot be negative' },
              max: { value: totalAmount, message: 'Amount cannot exceed total' }
            })}
            error={errors.amountPaid?.message}
          />

          {remainingAmount > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg"
            >
              <p className="text-orange-400 text-sm">
                Remaining Amount: {formatCurrency(remainingAmount)}
              </p>
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
            disabled={!watchedValues.merchantId || !watchedValues.weight || !watchedValues.pricePerUnit}
          >
            Record Purchase
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