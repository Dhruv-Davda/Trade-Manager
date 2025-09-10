import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { TrendingUp, Plus } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../utils/storage';
import { Trade, Merchant, MetalType, Stock } from '../../types';
import { generateId, formatCurrency } from '../../utils/calculations';

interface SellFormData {
  merchantId: string;
  metalType: MetalType;
  weight: number;
  pricePerUnit: number;
  laborCharges: number;
  amountReceived: number;
  settlementType: 'bill' | 'cash';
  notes?: string;
}

export const Sell: React.FC = () => {
  const [merchants, setMerchants] = useLocalStorage<Merchant[]>(STORAGE_KEYS.MERCHANTS, []);
  const [trades, setTrades] = useLocalStorage<Trade[]>(STORAGE_KEYS.TRADES, []);
  const [stock, setStock] = useLocalStorage<Stock[]>(STORAGE_KEYS.STOCK, []);
  const [showAddMerchant, setShowAddMerchant] = useState(false);
  const [newMerchant, setNewMerchant] = useState({ name: '', phone: '', email: '', olderDues: '' });
  
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<SellFormData>({
    defaultValues: {
      metalType: 'gold',
      settlementType: 'cash',
      laborCharges: 0,
      amountReceived: 0,
    }
  });

  const onError = (errors: any) => {
    console.log('Form validation errors:', errors);
  };

  const watchedValues = watch();
  //const metalValue = (watchedValues.weight || 0) * (watchedValues.pricePerUnit || 0);
  const metalValue = watchedValues.metalType === 'gold'  
  ? Number(watchedValues.weight || 0 )*Number(watchedValues.pricePerUnit || 0 )/10
  : Number(watchedValues.weight || 0 )*Number(watchedValues.pricePerUnit || 0);
  const totalAmount = Number(metalValue) + Number(watchedValues.laborCharges || 0);

  const onSubmit = (data: SellFormData) => {
    console.log('Form submitted with data:', data);
    const selectedMerchant = merchants.find(m => m.id === data.merchantId);
    if (!selectedMerchant) {
      console.log('Merchant not found');
      return;
    }

    const newTrade: Trade = {
      id: generateId(),
      type: 'sell',
      merchantId: data.merchantId,
      merchantName: selectedMerchant.name,
      metalType: data.metalType,
      weight: data.weight,
      pricePerUnit: data.pricePerUnit,
      totalAmount,
      amountReceived: data.amountReceived,
      laborCharges: data.laborCharges,
      settlementType: data.settlementType as any,
      notes: data.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('Adding new trade:', newTrade);
    setTrades([...trades, newTrade]);

    // Update stock levels (reduce stock when selling)
    const updatedStock = stock.map(stockItem => {
      if (stockItem.metalType === data.metalType) {
        const weightInGrams = data.metalType === 'gold' ? data.weight : data.weight * 1000; // Convert kg to grams for silver
        return {
          ...stockItem,
          quantity: Math.max(0, stockItem.quantity - weightInGrams), // Ensure stock doesn't go negative
          lastUpdated: new Date()
        };
      }
      return stockItem;
    });
    setStock(updatedStock);

    reset();
    
    alert('Sale recorded successfully! Stock updated.');
  };

  const addMerchant = () => {
    if (!newMerchant.name.trim()) return;

    // Parse older dues - if empty or invalid, default to 0
    const olderDuesAmount = newMerchant.olderDues.trim() === '' ? 0 : Number(newMerchant.olderDues) || 0;

    const merchant: Merchant = {
      id: generateId(),
      name: newMerchant.name,
      phone: newMerchant.phone,
      email: newMerchant.email,
      totalDue: olderDuesAmount,
      totalOwe: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setMerchants([...merchants, merchant]);
    setNewMerchant({ name: '', phone: '', email: '', olderDues: '' });
    setShowAddMerchant(false);
  };

  const merchantOptions = [
    { value: '', label: 'Select Customer' },
    ...merchants.map(merchant => ({
      value: merchant.id,
      label: merchant.name
    }))
  ];

  const metalOptions = [
    { value: 'gold', label: 'Gold' },
    { value: 'silver', label: 'Silver' },
  ];

  const settlementOptions = [
    { value: 'bill', label: 'Bill' },
    { value: 'cash', label: 'Cash' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-3"
      >
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Sell Transaction</h1>
          <p className="text-gray-400">Record a sale to customer</p>
        </div>
      </motion.div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Select
                label="Customer"
                options={merchantOptions}
                {...register('merchantId', { required: 'Please select a customer' })}
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
              label="Settlement Type"
              options={settlementOptions}
              {...register('settlementType')}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Labor Charges (Optional)"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('laborCharges', { 
                min: { value: 0, message: 'Labor charges cannot be negative' }
              })}
              error={errors.laborCharges?.message}
            />
            <Input
              label="AMT RECEIVED"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amountReceived', { 
                min: { value: 0, message: 'Amount received cannot be negative' }
              })}
              error={errors.amountReceived?.message}
            />
          </div>

          {totalAmount > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-700 p-4 rounded-lg space-y-2"
            >
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Metal Value:</span>
                <span className="text-white">{formatCurrency(metalValue)}</span>
              </div>
              {watchedValues.laborCharges > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">Labor Charges:</span>
                  <span className="text-white">{formatCurrency(watchedValues.laborCharges)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm font-medium border-t border-gray-600 pt-2">
                <span className="text-gray-300">Total Amount:</span>
                <span className="text-white">{formatCurrency(totalAmount)}</span>
              </div>
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
            Record Sale
          </Button>
        </form>
      </Card>

      <Modal
        isOpen={showAddMerchant}
        onClose={() => setShowAddMerchant(false)}
        title="Add New Customer"
      >
        <div className="space-y-4">
          <Input
            label="Customer Name"
            placeholder="Enter customer name"
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
          <Input
            label="Older Dues (Optional)"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={newMerchant.olderDues}
            onChange={(e) => setNewMerchant({ ...newMerchant, olderDues: e.target.value })}
          />
          <Button onClick={addMerchant} className="w-full">
            Add Customer
          </Button>
        </div>
      </Modal>
    </div>
  );
};