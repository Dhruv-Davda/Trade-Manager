import { Trade, Merchant } from '../types';

export const calculateMerchantBalance = (merchantId: string, trades: Trade[]): { due: number; owe: number } => {
  const merchantTrades = trades.filter(trade => trade.merchantId === merchantId);
  
  let due = 0;
  let owe = 0;

  merchantTrades.forEach(trade => {
    switch (trade.type) {
      case 'buy':
        if (trade.amountPaid && trade.totalAmount) {
          const remaining = trade.totalAmount - trade.amountPaid;
          if (remaining > 0) owe += remaining;
        }
        break;
      case 'sell':
        due += trade.totalAmount;
        break;
      case 'settlement':
        if (trade.settlementType === 'cash' || trade.settlementType === 'bank') {
          due -= trade.totalAmount;
        }
        break;
    }
  });

  return { due: Math.max(0, due), owe: Math.max(0, owe) };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatWeight = (weight: number, metalType: 'gold' | 'silver'): string => {
  const unit = metalType === 'gold' ? 'g' : 'kg';
  return `${weight.toFixed(2)} ${unit}`;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};