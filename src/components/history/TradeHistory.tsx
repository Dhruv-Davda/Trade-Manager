import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { History, Filter, Search, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../utils/storage';
import { Trade } from '../../types';
import { formatCurrency, formatWeight } from '../../utils/calculations';

export const TradeHistory: React.FC = () => {
  const [trades, setTrades] = useLocalStorage<Trade[]>(STORAGE_KEYS.TRADES, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterMetal, setFilterMetal] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  const filteredAndSortedTrades = useMemo(() => {
    let filtered = trades.filter(trade => {
      const matchesSearch = trade.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trade.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || trade.type === filterType;
      const matchesMetal = filterMetal === 'all' || trade.metalType === filterMetal;
      
      return matchesSearch && matchesType && matchesMetal;
    });

    // Sort trades
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'date_asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'amount_desc':
          return b.totalAmount - a.totalAmount;
        case 'amount_asc':
          return a.totalAmount - b.totalAmount;
        case 'merchant':
          return a.merchantName.localeCompare(b.merchantName);
        default:
          return 0;
      }
    });

    return filtered;
  }, [trades, searchTerm, filterType, filterMetal, sortBy]);

  const deleteTrade = (tradeId: string) => {
    if (window.confirm('Are you sure you want to delete this trade?')) {
      setTrades(trades.filter(trade => trade.id !== tradeId));
    }
  };

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'buy', label: 'Buy' },
    { value: 'sell', label: 'Sell' },
    { value: 'transfer', label: 'Transfer' },
    { value: 'settlement', label: 'Settlement' },
  ];

  const metalOptions = [
    { value: 'all', label: 'All Metals' },
    { value: 'gold', label: 'Gold' },
    { value: 'silver', label: 'Silver' },
  ];

  const sortOptions = [
    { value: 'date_desc', label: 'Newest First' },
    { value: 'date_asc', label: 'Oldest First' },
    { value: 'amount_desc', label: 'Highest Amount' },
    { value: 'amount_asc', label: 'Lowest Amount' },
    { value: 'merchant', label: 'Merchant Name' },
  ];

  const getTradeTypeColor = (type: string) => {
    switch (type) {
      case 'buy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'sell': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'transfer': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'settlement': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-3"
      >
        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <History className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Trade History</h1>
          <p className="text-gray-400">View and manage all transactions</p>
        </div>
      </motion.div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Input
            placeholder="Search merchants or notes..."
            icon={<Search className="w-4 h-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            options={typeOptions}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          />
          <Select
            options={metalOptions}
            value={filterMetal}
            onChange={(e) => setFilterMetal(e.target.value)}
          />
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          />
          <Button variant="outline" className="flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-gray-400">
            Showing {filteredAndSortedTrades.length} of {trades.length} transactions
          </p>
        </div>

        {filteredAndSortedTrades.length > 0 ? (
          <div className="space-y-3">
            {filteredAndSortedTrades.map((trade, index) => (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hover className="p-4">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTradeTypeColor(trade.type)}`}>
                          {trade.type.toUpperCase()}
                        </span>
                        {trade.metalType && (
                          <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">
                            {trade.metalType.toUpperCase()}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {format(new Date(trade.createdAt), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-gray-400">Merchant:</span>
                          <p className="text-white font-medium">{trade.merchantName}</p>
                        </div>
                        
                        {trade.weight && trade.metalType && (
                          <div>
                            <span className="text-gray-400">Weight:</span>
                            <p className="text-white">{formatWeight(trade.weight, trade.metalType)}</p>
                          </div>
                        )}
                        
                        {trade.pricePerUnit && (
                          <div>
                            <span className="text-gray-400">Price per Unit:</span>
                            <p className="text-white">{formatCurrency(trade.pricePerUnit)}</p>
                          </div>
                        )}
                        
                        <div>
                          <span className="text-gray-400">Total Amount:</span>
                          <p className="text-white font-semibold">{formatCurrency(trade.totalAmount)}</p>
                        </div>
                      </div>

                      {trade.notes && (
                        <div className="mt-2">
                          <span className="text-gray-400 text-sm">Notes:</span>
                          <p className="text-gray-300 text-sm">{trade.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => console.log('Edit trade:', trade.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTrade(trade.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No transactions found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters or add some trades</p>
          </Card>
        )}
      </div>
    </div>
  );
};