import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  TrendingUp, 
  RefreshCw, 
  DollarSign,
  TrendingDown,
  Coins,
  Package,
  Scale
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/calculations';
import { TradeService } from '../../services/tradeService';
import { StockService } from '../../services/stockService';
import { useDataCache } from '../../hooks/useDataCache';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stock, setStock] = React.useState<{ gold: number; silver: number }>({ gold: 0, silver: 0 });

  // Use cached data loading for trades
  const { 
    data: trades = [], 
    isLoading: tradesLoading
  } = useDataCache(
    'dashboard_trades',
    async () => {
      const { trades: dbTrades, error } = await TradeService.getTrades();
      if (error) throw new Error(error);
      return dbTrades;
    },
    { expiresIn: 2 * 60 * 1000 } // 2 minutes cache
  );

  // Load stock data
  React.useEffect(() => {
    const loadStock = async () => {
      try {
        const { stock: dbStock, error: stockError } = await StockService.calculateAndUpdateStockFromTrades();
        if (stockError) {
          console.error('❌ Dashboard: Error calculating stock:', stockError);
        } else {
          // Convert stock array to object for easier access
          const stockObj = { gold: 0, silver: 0 };
          dbStock.forEach(stockItem => {
            if (stockItem.metalType === 'gold') {
              stockObj.gold = stockItem.quantity;
            } else if (stockItem.metalType === 'silver') {
              stockObj.silver = stockItem.quantity;
            }
          });
          setStock(stockObj);
        }
      } catch (error) {
        console.error('❌ Dashboard: Error loading stock:', error);
      }
    };

    loadStock();
  }, [trades]); // Reload stock when trades change


  // Calculate dashboard statistics
  const stats = React.useMemo(() => {
    const totalTrades = trades?.length || 0;
    const totalRevenue = trades
      ?.filter(trade => trade.type === 'sell')
      .reduce((sum, trade) => Number(sum) + Number(trade.totalAmount || 0), 0) || 0;
    
    const totalPurchases = trades
      ?.filter(trade => trade.type === 'buy')
      .reduce((sum, trade) => Number(sum) + Number(trade.totalAmount || 0), 0) || 0;

    return {
      totalTrades,
      totalRevenue,
      totalPurchases,
      goldStock: stock.gold, // Already in grams
      silverStock: stock.silver / 1000, // Convert grams to kg for display
    };
  }, [trades, stock]);

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
      title: 'Gold Stock',
      value: stats.goldStock,
      icon: Package,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      unit: 'gms',
    },
    {
      title: 'Silver Stock',
      value: stats.silverStock,
      icon: Scale,
      color: 'text-gray-400',
      bgColor: 'bg-gray-400/10',
      unit: 'kg',
    },
  ];

  if (tradesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-4xl font-bold font-display gradient-text text-shadow-lg">
            Dashboard
          </h1>
          <p className="text-secondary-400 mt-2">Welcome back! Here's your trading overview.</p>
        </div>
        <Button
          onClick={() => navigate('/analytics')}
          variant="outline"
          size="lg"
        >
          View Analytics
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card hover glow className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-secondary-400 mb-2 font-medium">{stat.title}</p>
                  <p className={`text-2xl font-bold text-shadow ${
                    (stat.title === 'Gold Stock' || stat.title === 'Silver Stock') && stat.value < 0 
                      ? 'text-red-400' 
                      : 'text-white'
                  }`}>
                    {stat.unit ? `${stat.value} ${stat.unit}` : formatCurrency(stat.value)}
                  </p>
                </div>
                <div className={`p-4 rounded-xl ${stat.bgColor} shadow-lg`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div>
          <h2 className="text-2xl font-bold font-display text-white text-shadow">Quick Actions</h2>
          <p className="text-secondary-400 mt-1">Start a new transaction or manage your trades</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card
                hover
                glow
                className="p-8 cursor-pointer group"
                onClick={() => navigate(action.path)}
              >
                <div className="text-center space-y-4">
                  <motion.div 
                    className={`w-16 h-16 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-glow transition-all duration-300`}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                  >
                    <action.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:gradient-text transition-all duration-300">
                      {action.title}
                    </h3>
                    <p className="text-sm text-secondary-400 mt-2 group-hover:text-white transition-colors duration-300">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>


      {/* Recent Activity */}
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div>
          <h2 className="text-2xl font-bold font-display text-white text-shadow">Recent Transactions</h2>
          <p className="text-secondary-400 mt-1">Your latest trading activity</p>
        </div>
        <Card className="p-6">
          {trades && trades.length > 0 ? (
            <div className="space-y-4">
              {trades.slice(-5).reverse().map((trade, index) => (
                <motion.div
                  key={trade.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between py-4 border-b border-secondary-700/50 last:border-b-0 hover:bg-white/5 rounded-lg px-4 -mx-4 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${
                      trade.type === 'buy' ? 'status-success' :
                      trade.type === 'sell' ? 'status-info' :
                      trade.type === 'transfer' ? 'status-warning' :
                      'status-danger'
                    }`}>
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white font-semibold capitalize text-lg">{trade.type}</p>
                      <p className="text-sm text-secondary-400">{trade.merchantName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-lg">{formatCurrency(trade.totalAmount)}</p>
                    <p className="text-xs text-secondary-400">
                      {new Date(trade.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Coins className="w-10 h-10 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No transactions yet</h3>
              <p className="text-secondary-400 mb-6">Start by adding your first trade to see it here</p>
              <Button onClick={() => navigate('/buy')} size="lg">
                Add Transaction
              </Button>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};