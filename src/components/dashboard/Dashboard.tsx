import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  TrendingUp, 
  RefreshCw, 
  DollarSign,
  Users,
  TrendingDown,
  Coins,
  BarChart3
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../utils/storage';
import { Trade, Merchant } from '../../types';
import { formatCurrency, calculateMerchantBalance } from '../../utils/calculations';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [trades] = useLocalStorage<Trade[]>(STORAGE_KEYS.TRADES, []);
  const [merchants] = useLocalStorage<Merchant[]>(STORAGE_KEYS.MERCHANTS, []);

  // Calculate dashboard statistics
  const stats = React.useMemo(() => {
    const totalTrades = trades.length;
    const totalRevenue = trades
      .filter(trade => trade.type === 'sell')
      .reduce((sum, trade) => sum + trade.totalAmount, 0);
    
    const totalPurchases = trades
      .filter(trade => trade.type === 'buy')
      .reduce((sum, trade) => sum + trade.totalAmount, 0);

    let totalDues = 0;
    let totalOwes = 0;

    merchants.forEach(merchant => {
      const balance = calculateMerchantBalance(merchant.id, trades);
      totalDues += balance.due;
      totalOwes += balance.owe;
    });

    return {
      totalTrades,
      totalRevenue,
      totalPurchases,
      totalDues,
      totalOwes,
      netProfit: totalRevenue - totalPurchases,
    };
  }, [trades, merchants]);

  const quickActions = [
    {
      title: 'Buy',
      description: 'Purchase gold or silver',
      icon: ShoppingCart,
      color: 'from-green-500 to-green-600',
      path: '/buy',
    },
    {
      title: 'Sell',
      description: 'Sell to customers',
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600',
      path: '/sell',
    },
    {
      title: 'Transfer',
      description: 'Transfer metals',
      icon: RefreshCw,
      color: 'from-purple-500 to-purple-600',
      path: '/transfer',
    },
    {
      title: 'Settlement',
      description: 'Settle dues',
      icon: DollarSign,
      color: 'from-orange-500 to-orange-600',
      path: '/settlement',
    },
  ];

  const statsCards = [
    {
      title: 'Total Revenue',
      value: stats.totalRevenue,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
    },
    {
      title: 'Total Purchases',
      value: stats.totalPurchases,
      icon: TrendingDown,
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
    },
    {
      title: 'Net Profit',
      value: stats.netProfit,
      icon: BarChart3,
      color: stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400',
      bgColor: stats.netProfit >= 0 ? 'bg-green-400/10' : 'bg-red-400/10',
    },
    {
      title: 'Total Merchants',
      value: merchants.length,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      isCount: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <Button
          onClick={() => navigate('/analytics')}
          variant="outline"
        >
          View Analytics
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card hover className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                  <p className="text-xl font-bold text-white">
                    {stat.isCount ? stat.value : formatCurrency(stat.value)}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                hover
                className="p-6 cursor-pointer border-gray-600 hover:border-gray-500 transition-colors"
                onClick={() => navigate(action.path)}
              >
                <div className="text-center space-y-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mx-auto`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{action.title}</h3>
                    <p className="text-sm text-gray-400">{action.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
        <Card className="p-4">
          {trades.length > 0 ? (
            <div className="space-y-3">
              {trades.slice(-5).reverse().map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      trade.type === 'buy' ? 'bg-green-400/10 text-green-400' :
                      trade.type === 'sell' ? 'bg-blue-400/10 text-blue-400' :
                      trade.type === 'transfer' ? 'bg-purple-400/10 text-purple-400' :
                      'bg-orange-400/10 text-orange-400'
                    }`}>
                      <Coins className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-white font-medium capitalize">{trade.type}</p>
                      <p className="text-sm text-gray-400">{trade.merchantName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{formatCurrency(trade.totalAmount)}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(trade.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Coins className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No transactions yet</p>
              <p className="text-sm text-gray-500 mb-4">Start by adding your first trade</p>
              <Button onClick={() => navigate('/buy')}>Add Transaction</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};