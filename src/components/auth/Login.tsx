import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, Mail, Building, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    businessName: '',
    phoneNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    login({
      email: formData.email,
      businessName: formData.businessName || 'My Business',
      phoneNumber: formData.phoneNumber || '',
    });
    
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const demoLogin = () => {
    login({
      email: 'demo@trademanager.com',
      businessName: 'Gold & Silver Trading Co.',
      phoneNumber: '+91 98765 43210',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">TradeManager</h2>
            <p className="text-gray-400">Manage your gold & silver trades</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              name="email"
              label="Email Address"
              placeholder="Enter your email"
              icon={<Mail className="w-4 h-4" />}
              value={formData.email}
              onChange={handleInputChange}
              required
            />

            {isSignUp && (
              <>
                <Input
                  type="text"
                  name="businessName"
                  label="Business Name"
                  placeholder="Enter your business name"
                  icon={<Building className="w-4 h-4" />}
                  value={formData.businessName}
                  onChange={handleInputChange}
                  required
                />
                
                <Input
                  type="tel"
                  name="phoneNumber"
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  icon={<Phone className="w-4 h-4" />}
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                />
              </>
            )}

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 flex flex-col space-y-2">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-center text-sm text-gray-400 hover:text-white transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
            
            <Button
              variant="outline"
              onClick={demoLogin}
              className="w-full"
            >
              Try Demo Account
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};