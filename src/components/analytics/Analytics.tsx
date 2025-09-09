import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Card } from '../ui/Card';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../utils/storage';
import { Trade, Expense } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

export const Analytics: React.FC = () => {
  const [trades] = useLocalStorage<Trade[]>(STORAGE_KEYS.TRADES, []);
  const [expenses] = useLocalStorage<Expense[]>(STORAGE_KEYS.EXPENSES, []);

  const analytics = useMemo(() => {
    // Calculate basic metrics
    const buyTrades = trades.filter(t => t.type === 'buy');
    const sellTrades = trades.filter(t => t.type === 'sell');
    
    const totalPurchases = buyTrades.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalSales = sellTrades.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const grossProfit = totalSales - totalPurchases;
    const netProfit = grossProfit - totalExpenses;

    // Monthly data for the last 12 months
    const last12Months = eachMonthOfInterval({
      start: subMonths(new Date(), 11),
      end: new Date()
    });

    const monthlyData = last12Months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthTrades = trades.filter(trade => {
        const tradeDate = new Date(trade.createdAt);
        return tradeDate >= monthStart && tradeDate <= monthEnd;
      });

      const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= monthStart && expenseDate <= monthEnd;
      });

      const sales = monthTrades.filter(t => t.type === 'sell').reduce((sum, t) => sum + t.totalAmount, 0);
      const purchases = monthTrades.filter(t => t.type === 'buy').reduce((sum, t) => sum + t.totalAmount, 0);
      const expenseAmount = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

      return {
        month: format(month, 'MMM yyyy'),
        sales,
        purchases,
        expenses: expenseAmount,
        profit: sales - purchases - expenseAmount,
      };
    });

    // Trade type distribution
    const tradeTypes = [
      { name: 'Buy', value: buyTrades.length, color: '#10b981' },
      { name: 'Sell', value: sellTrades.length, color: '#3b82f6' },
      { name: 'Transfer', value: trades.filter(t => t.type === 'transfer').length, color: '#8b5cf6' },
      { name: 'Settlement', value: trades.filter(t => t.type === 'settlement').length, color: '#f59e0b' },
    ];

    // Metal type distribution
    const goldTrades = trades.filter(t => t.metalType === 'gold');
    const silverTrades = trades.filter(t => t.metalType === 'silver');
    
    const metalDistribution = [
      { name: 'Gold', value: goldTrades.length, color: '#fbbf24' },
      { name: 'Silver', value: silverTrades.length, color: '#6b7280' },
    ];

    return {
      totalPurchases,
      totalSales,
      totalExpenses,
      grossProfit,
      netProfit,
      monthlyData,
      tradeTypes,
      metalDistribution,
      totalTrades: trades.length,
    };
  }, [trades, expenses]);

  const statsCards = [
    {
      title: 'Total Sales',
      value: analytics.totalSales,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      change: '+12%',
    },
    {
      title: 'Total Purchases',
      value: analytics.totalPurchases,
      icon: TrendingDown,
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
      change: '+8%',
    },
    {
      title: 'Gross Profit',
      value: analytics.grossProfit,
      icon: DollarSign,
      color: analytics.grossProfit >= 0 ? 'text-green-400' : 'text-red-400',
      bgColor: analytics.grossProfit >= 0 ? 'bg-green-400/10' : 'bg-red-400/10',
      change: '+15%',
    },
    {
      title: 'Net Profit',
      value: analytics.netProfit,
      icon: BarChart3,
      color: analytics.netProfit >= 0 ? 'text-green-400' : 'text-red-400',
      bgColor: analytics.netProfit >= 0 ? 'bg-green-400/10' : 'bg-red-400/10',
      change: '+10%',
    },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-3"
      >
        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400">Business insights and performance metrics</p>
        </div>
      </motion.div>

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
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className={`text-xs ${stat.color}`}>{stat.change}</span>
              </div>
              <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
              <p className="text-xl font-bold text-white">{formatCurrency(stat.value)}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [formatCurrency(value)]}
              />
              <Bar dataKey="sales" fill="#10b981" name="Sales" />
              <Bar dataKey="purchases" fill="#ef4444" name="Purchases" />
              <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Trade Type Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Trade Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.tradeTypes}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {analytics.tradeTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {analytics.tradeTypes.map((type, index) => (
              <div key={type.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: type.color }}
                />
                <span className="text-sm text-gray-300">{type.name}: {type.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Profit Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Profit Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [formatCurrency(value), 'Profit']}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Metal Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Metal Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.metalDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {analytics.metalDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {analytics.metalDistribution.map((metal, index) => (
              <div key={metal.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: metal.color }}
                  />
                  <span className="text-sm text-gray-300">{metal.name}</span>
                </div>
                <span className="text-sm text-white font-medium">{metal.value} trades</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};