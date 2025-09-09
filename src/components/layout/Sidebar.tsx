import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  TrendingUp, 
  History, 
  BarChart3, 
  Receipt,
  Users,
  Coins
} from 'lucide-react';
import { motion } from 'framer-motion';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Buy', href: '/buy', icon: ShoppingCart },
  { name: 'Sell', href: '/sell', icon: TrendingUp },
  { name: 'Transfer', href: '/transfer', icon: Receipt },
  { name: 'Settlement', href: '/settlement', icon: Coins },
  { name: 'Trade History', href: '/history', icon: History },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Merchants', href: '/merchants', icon: Users },
];

export const Sidebar: React.FC = () => {
  return (
    <div className="fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 border-r border-gray-700 transform -translate-x-full lg:translate-x-0 transition-transform duration-200 ease-in-out">
      <div className="flex flex-col h-full">
        <div className="flex items-center px-6 py-4 border-b border-gray-700">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <span className="ml-3 text-xl font-bold text-white">TradeManager</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg transition-colors group ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <motion.div 
                  className="flex items-center w-full"
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                  <span className="font-medium">{item.name}</span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};