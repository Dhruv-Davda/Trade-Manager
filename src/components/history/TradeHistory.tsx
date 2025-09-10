import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  Search, 
  Filter, 
  Edit, 
  Trash2 
} from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../utils/storage';
import { Trade } from '../../types';
import { formatCurrency, formatWeight } from '../../utils/calculations';

export const TradeHistory: React.FC = () => {
  const [trades, setTrades] = useLocalStorage<Trade[]>(STORAGE_KEYS.TRADES, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string[]>(['all']);
  const [filterMetal, setFilterMetal] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Debug logging
  console.log('TradeHistory - trades:', trades);
  console.log('TradeHistory - trades length:', trades?.length);

  const filteredAndSortedTrades = useMemo(() => {
    console.log('🔍 Processing trades:', trades);
    console.log('🔍 Trades type:', typeof trades);
    console.log('🔍 Is array:', Array.isArray(trades));
    
    try {
      // Ensure trades is an array
      if (!Array.isArray(trades)) {
        console.error('❌ Trades is not an array:', trades);
        return [];
      }

      if (trades.length === 0) {
        console.log('ℹ️ No trades found');
        return [];
      }

      console.log('✅ Processing', trades.length, 'trades');

      let filtered = trades.filter((trade, index) => {
        try {
          console.log(`🔍 Processing trade ${index}:`, trade);
          
          // Ensure trade has required properties
          if (!trade || typeof trade !== 'object') {
            console.warn(`❌ Invalid trade object at index ${index}:`, trade);
            return false;
          }

          // More flexible property access using type assertion
          const tradeAny = trade as any;
          const merchantName = trade.merchantName || tradeAny.merchant || tradeAny.customerName || '';
          const notes = trade.notes || tradeAny.description || '';
          const tradeType = trade.type || tradeAny.transactionType || 'unknown';
          const metalType = trade.metalType || tradeAny.metal || '';

          console.log(`📊 Trade ${index} data:`, {
            merchantName,
            notes,
            tradeType,
            metalType,
            searchTerm,
            filterType,
            filterMetal
          });

          const matchesSearch = merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               notes.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesType = filterType.includes('all') || filterType.includes(tradeType) || 
                             (filterType.includes('cash') && trade.settlementType === 'cash') ||
                             (filterType.includes('bill') && trade.settlementType === 'bill');
          const matchesMetal = filterMetal === 'all' || metalType === filterMetal;
          
          const shouldInclude = matchesSearch && matchesType && matchesMetal;
          console.log(`✅ Trade ${index} included:`, shouldInclude);
          
          return shouldInclude;
        } catch (error) {
          console.error(`❌ Error filtering trade ${index}:`, error, trade);
          return false;
        }
      });

      console.log('✅ Filtered trades:', filtered.length);

      // Sort trades
      filtered.sort((a, b) => {
        try {
          const aAny = a as any;
          const bAny = b as any;
          
          switch (sortBy) {
            case 'date_desc':
              return new Date(b.createdAt || bAny.date || 0).getTime() - new Date(a.createdAt || aAny.date || 0).getTime();
            case 'date_asc':
              return new Date(a.createdAt || aAny.date || 0).getTime() - new Date(b.createdAt || bAny.date || 0).getTime();
            case 'amount_desc':
              return (b.totalAmount || bAny.amount || bAny.value || 0) - (a.totalAmount || aAny.amount || aAny.value || 0);
            case 'amount_asc':
              return (a.totalAmount || aAny.amount || aAny.value || 0) - (b.totalAmount || bAny.amount || bAny.value || 0);
            case 'merchant':
              const aMerchant = a.merchantName || aAny.merchant || aAny.customerName || '';
              const bMerchant = b.merchantName || bAny.merchant || bAny.customerName || '';
              return aMerchant.localeCompare(bMerchant);
            default:
              return 0;
          }
        } catch (error) {
          console.error('❌ Error sorting trades:', error);
          return 0;
        }
      });

      console.log('✅ Final filtered trades:', filtered);
      return filtered;
    } catch (error) {
      console.error('❌ Error in filteredAndSortedTrades:', error);
      return [];
    }
  }, [trades, searchTerm, filterType, filterMetal, sortBy]);

  const deleteTrade = (tradeId: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this trade?')) {
        if (Array.isArray(trades)) {
          setTrades(trades.filter(trade => trade && trade.id !== tradeId));
        }
      }
    } catch (error) {
      console.error('Error deleting trade:', error);
    }
  };

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'buy', label: 'Buy' },
    { value: 'sell', label: 'Sell' },
    { value: 'transfer', label: 'Transfer' },
    { value: 'settlement', label: 'Settlement' },
    { value: 'cash', label: 'Cash' },
    { value: 'bill', label: 'Bill' },
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
      {/* Test component to verify rendering
      <div className="p-4 bg-green-500 text-white rounded-lg">
        <h2 className="text-xl font-bold">✅ Trade History Component is Working!</h2>
        <p>Trades count: {Array.isArray(trades) ? trades.length : 'Invalid data'}</p>
        <p>Filtered trades: {filteredAndSortedTrades.length}</p>
      </div> */}
      
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
            value={filterType.includes('all') ? 'all' : filterType[0] || 'all'}
            onChange={(e) => {
              if (e.target.value === 'all') {
                setFilterType(['all']);
              } else {
                setFilterType([e.target.value]);
              }
            }}
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
          <Button 
            variant="outline" 
            className="flex items-center"
            onClick={() => setShowFilterModal(true)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
            {filterType.length > 1 || (filterType.length === 1 && !filterType.includes('all')) ? (
              <span className="ml-2 px-2 py-1 bg-primary-500 text-white text-xs rounded-full">
                {filterType.filter(f => f !== 'all').length}
              </span>
            ) : null}
          </Button>
        </div>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-gray-400">
            Showing {filteredAndSortedTrades.length} of {Array.isArray(trades) ? trades.length : 0} transactions
          </p>
        </div>

        {/* Debug info */}
        {!Array.isArray(trades) && (
          <Card className="p-4 bg-yellow-500/10 border border-yellow-500/30">
            <p className="text-yellow-400">Warning: Trades data is not in expected format</p>
            <p className="text-sm text-yellow-300 mt-1">Data: {JSON.stringify(trades)}</p>
          </Card>
        )}

        {filteredAndSortedTrades.length > 0 ? (
          <div className="space-y-3">
            {filteredAndSortedTrades.map((trade, index) => {
              try {
                // Generate a key if id is missing
                const tradeKey = trade?.id || `trade-${index}`;
                
                // Log the trade structure for debugging
                console.log(`🎨 Rendering trade ${index}:`, trade);
                console.log(`🎨 Trade type:`, typeof trade);
                console.log(`🎨 Trade keys:`, trade ? Object.keys(trade) : 'null');

                if (!trade) {
                  console.warn(`❌ Invalid trade in render ${index}:`, trade);
                  return null;
                }

                const tradeAny = trade as any;

              return (
                <motion.div
                  key={tradeKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card hover className="p-4">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTradeTypeColor(trade.type || tradeAny.transactionType || 'unknown')}`}>
                            {(trade.type || tradeAny.transactionType || 'UNKNOWN').toUpperCase()}
                          </span>
                          {(trade.metalType || tradeAny.metal) && (
                            <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">
                              {(trade.metalType || tradeAny.metal).toUpperCase()}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {trade.createdAt ? format(new Date(trade.createdAt), 'MMM dd, yyyy HH:mm') : 'No date'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">Merchant:</span>
                            <p className="text-white font-medium">{trade.merchantName || tradeAny.merchant || tradeAny.customerName || 'Unknown'}</p>
                          </div>
                          
                          {(trade.weight || tradeAny.quantity) && (trade.metalType || tradeAny.metal) && (
                            <div>
                              <span className="text-gray-400">Weight:</span>
                              <p className="text-white">{formatWeight(trade.weight || tradeAny.quantity, (trade.metalType || tradeAny.metal) as 'gold' | 'silver')}</p>
                            </div>
                          )}
                          
                          {(trade.pricePerUnit || tradeAny.price || tradeAny.rate) && (
                            <div>
                              <span className="text-gray-400">Price per Unit:</span>
                              <p className="text-white">{formatCurrency(trade.pricePerUnit || tradeAny.price || tradeAny.rate)}</p>
                            </div>
                          )}
                          
                          <div>
                            <span className="text-gray-400">Total Amount:</span>
                            <p className="text-white font-semibold">{formatCurrency(trade.totalAmount || tradeAny.amount || tradeAny.value || 0)}</p>
                          </div>
                        </div>

                        {(trade.notes || tradeAny.description) && (
                          <div className="mt-2">
                            <span className="text-gray-400 text-sm">Notes:</span>
                            <p className="text-gray-300 text-sm">{trade.notes || tradeAny.description}</p>
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
                          onClick={() => {
                            if (trade.id) {
                              deleteTrade(trade.id);
                            } else {
                              console.warn('Cannot delete trade without ID:', trade);
                            }
                          }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
              } catch (error) {
                console.error(`❌ Error rendering trade ${index}:`, error, trade);
                return (
                  <div key={`error-${index}`} className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400">Error displaying trade data</p>
                    <p className="text-sm text-red-300 mt-1">Trade index: {index}</p>
                    <p className="text-xs text-red-200 mt-1">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
                  </div>
                );
              }
            })}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No transactions found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters or add some trades</p>
          </Card>
        )}
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowFilterModal(false);
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-secondary-800 rounded-xl border border-white/10 p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Filter Transactions</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Transaction Types */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Transaction Types</h4>
                <div className="space-y-2">
                  {typeOptions.map(option => (
                    <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filterType.includes(option.value)}
                        onChange={(e) => {
                          if (option.value === 'all') {
                            setFilterType(['all']);
                          } else {
                            const newFilters = e.target.checked
                              ? [...filterType.filter(f => f !== 'all'), option.value]
                              : filterType.filter(f => f !== option.value);
                            setFilterType(newFilters.length === 0 ? ['all'] : newFilters);
                          }
                        }}
                        className="w-4 h-4 text-primary-500 bg-secondary-700 border-secondary-600 rounded focus:ring-primary-500 focus:ring-2"
                      />
                      <span className="text-white text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Metal Types */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Metal Types</h4>
                <div className="space-y-2">
                  {metalOptions.map(option => (
                    <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="metalType"
                        checked={filterMetal === option.value}
                        onChange={(e) => setFilterMetal(e.target.value)}
                        className="w-4 h-4 text-primary-500 bg-secondary-700 border-secondary-600 focus:ring-primary-500 focus:ring-2"
                      />
                      <span className="text-white text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Sort By</h4>
                <div className="space-y-2">
                  {sortOptions.map(option => (
                    <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="sortBy"
                        checked={sortBy === option.value}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-4 h-4 text-primary-500 bg-secondary-700 border-secondary-600 focus:ring-primary-500 focus:ring-2"
                      />
                      <span className="text-white text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  setFilterType(['all']);
                  setFilterMetal('all');
                  setSortBy('date_desc');
                }}
                className="flex-1"
              >
                Clear All
              </Button>
              <Button
                onClick={() => setShowFilterModal(false)}
                className="flex-1"
              >
                Apply Filters
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};