import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../utils/storage';
import { Merchant, Trade } from '../../types';
import { generateId, formatCurrency, calculateMerchantBalance } from '../../utils/calculations';

export const Merchants: React.FC = () => {
  const [merchants, setMerchants] = useLocalStorage<Merchant[]>(STORAGE_KEYS.MERCHANTS, []);
  const [trades] = useLocalStorage<Trade[]>(STORAGE_KEYS.TRADES, []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMerchant) {
      // Update existing merchant
      const updatedMerchants = merchants.map(merchant =>
        merchant.id === editingMerchant.id
          ? { ...merchant, ...formData, updatedAt: new Date() }
          : merchant
      );
      setMerchants(updatedMerchants);
      setEditingMerchant(null);
    } else {
      // Add new merchant
      const newMerchant: Merchant = {
        id: generateId(),
        ...formData,
        totalDue: 0,
        totalOwe: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setMerchants([...merchants, newMerchant]);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', address: '' });
    setShowAddModal(false);
    setEditingMerchant(null);
  };

  const editMerchant = (merchant: Merchant) => {
    setEditingMerchant(merchant);
    setFormData({
      name: merchant.name,
      email: merchant.email || '',
      phone: merchant.phone || '',
      address: merchant.address || '',
    });
    setShowAddModal(true);
  };

  const deleteMerchant = (merchantId: string) => {
    const merchantTrades = trades.filter(trade => trade.merchantId === merchantId);
    
    if (merchantTrades.length > 0) {
      alert('Cannot delete merchant with existing trades. Please delete all trades first.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this merchant?')) {
      setMerchants(merchants.filter(merchant => merchant.id !== merchantId));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Merchants</h1>
            <p className="text-gray-400">Manage your business partners</p>
          </div>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Merchant
        </Button>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Merchants</p>
              <p className="text-xl font-bold text-white">{merchants.length}</p>
            </div>
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Dues</p>
              <p className="text-xl font-bold text-green-400">
                {formatCurrency(
                  merchants.reduce((sum, merchant) => {
                    const balance = calculateMerchantBalance(merchant.id, trades);
                    return sum + balance.due;
                  }, 0)
                )}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Owes</p>
              <p className="text-xl font-bold text-red-400">
                {formatCurrency(
                  merchants.reduce((sum, merchant) => {
                    const balance = calculateMerchantBalance(merchant.id, trades);
                    return sum + balance.owe;
                  }, 0)
                )}
              </p>
            </div>
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-red-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Merchants List */}
      {merchants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {merchants.map((merchant, index) => {
            const balance = calculateMerchantBalance(merchant.id, trades);
            const merchantTradeCount = trades.filter(trade => trade.merchantId === merchant.id).length;
            
            return (
              <motion.div
                key={merchant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editMerchant(merchant)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMerchant(merchant.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">{merchant.name}</h3>
                  
                  <div className="space-y-2 mb-4">
                    {merchant.phone && (
                      <div className="flex items-center text-sm text-gray-400">
                        <Phone className="w-4 h-4 mr-2" />
                        {merchant.phone}
                      </div>
                    )}
                    {merchant.email && (
                      <div className="flex items-center text-sm text-gray-400">
                        <Mail className="w-4 h-4 mr-2" />
                        {merchant.email}
                      </div>
                    )}
                    {merchant.address && (
                      <div className="flex items-center text-sm text-gray-400">
                        <MapPin className="w-4 h-4 mr-2" />
                        {merchant.address}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Due Amount:</span>
                      <span className="text-green-400 font-medium">
                        {formatCurrency(balance.due)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Owe Amount:</span>
                      <span className="text-red-400 font-medium">
                        {formatCurrency(balance.owe)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Total Trades:</span>
                      <span className="text-white font-medium">{merchantTradeCount}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-500">
                      Added {new Date(merchant.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No merchants added yet</p>
          <p className="text-sm text-gray-500 mb-4">Start by adding your first business partner</p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Merchant
          </Button>
        </Card>
      )}

      {/* Add/Edit Merchant Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={resetForm}
        title={editingMerchant ? 'Edit Merchant' : 'Add New Merchant'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Merchant Name"
            name="name"
            placeholder="Enter merchant name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />

          <Input
            label="Phone Number (Optional)"
            name="phone"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={handleInputChange}
          />

          <Input
            label="Email (Optional)"
            name="email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={handleInputChange}
          />

          <Input
            label="Address (Optional)"
            name="address"
            placeholder="Enter address"
            value={formData.address}
            onChange={handleInputChange}
          />

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingMerchant ? 'Update Merchant' : 'Add Merchant'}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};