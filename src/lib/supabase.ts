import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project credentials
// You can get these from your Supabase project settings → API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ghnklvwvglwrhioetezb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdobmtsdnd2Z2x3cmhpb2V0ZXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MDU3ODAsImV4cCI6MjA3MzA4MTc4MH0.dwdcbR7HMXmqjF1vDivAsOTnvsuMPHGT2xQIQBknFWM';

// Clear browser cache to fix incognito vs normal browser issue
console.log('🧹 Clearing browser cache for Supabase...');
try {
  // Clear all Supabase-related data
  Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
      localStorage.removeItem(key);
      console.log('🗑️ Removed localStorage:', key);
    }
  });
  
  Object.keys(sessionStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
      sessionStorage.removeItem(key);
      console.log('🗑️ Removed sessionStorage:', key);
    }
  });
  
  console.log('✅ Browser cache cleared');
} catch (error) {
  console.log('⚠️ Could not clear cache:', error);
}

// Create Supabase client with session persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Test connection
console.log('🔗 Supabase URL:', supabaseUrl);
console.log('🔑 Supabase Key:', supabaseAnonKey.substring(0, 20) + '...');

// Database types (we'll create these tables in Supabase)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          business_name: string;
          phone_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          business_name: string;
          phone_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          business_name?: string;
          phone_number?: string | null;
          updated_at?: string;
        };
      };
      trades: {
        Row: {
          id: string;
          user_id: string;
          user_email: string; // Add email field for shared data
          type: 'buy' | 'sell' | 'transfer' | 'settlement';
          metal_type: 'gold' | 'silver';
          quantity: number;
          rate: number;
          amount: number;
          merchant_id: string | null;
          party_name: string;
          party_phone: string | null;
          party_address: string | null;
          settlement_type: 'cash' | 'bank' | 'gold' | 'silver' | null;
          settlement_direction: 'receiving' | 'paying' | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_email: string; // Add email field for shared data
          type: 'buy' | 'sell' | 'transfer' | 'settlement';
          metal_type: 'gold' | 'silver';
          quantity: number;
          rate: number;
          amount: number;
          merchant_id?: string | null;
          party_name: string;
          party_phone?: string | null;
          party_address?: string | null;
          settlement_type?: 'cash' | 'bank' | 'gold' | 'silver' | null;
          settlement_direction?: 'receiving' | 'paying' | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          user_email?: string; // Add email field for shared data
          type?: 'buy' | 'sell' | 'transfer' | 'settlement';
          metal_type?: 'gold' | 'silver';
          quantity?: number;
          rate?: number;
          amount?: number;
          merchant_id?: string | null;
          party_name?: string;
          party_phone?: string | null;
          party_address?: string | null;
          settlement_type?: 'cash' | 'bank' | 'gold' | 'silver' | null;
          settlement_direction?: 'receiving' | 'paying' | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      income: {
        Row: {
          id: string;
          user_id: string;
          user_email: string;
          category: string;
          description: string;
          amount: number;
          date: string;
          payment_type: 'cash' | 'bank_transfer' | 'upi' | 'cheque';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_email: string;
          category: string;
          description: string;
          amount: number;
          date: string;
          payment_type: 'cash' | 'bank_transfer' | 'upi' | 'cheque';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          user_email?: string;
          category?: string;
          description?: string;
          amount?: number;
          date?: string;
          payment_type?: 'cash' | 'bank_transfer' | 'upi' | 'cheque';
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          user_email: string;
          category: string;
          description: string;
          amount: number;
          date: string;
          payment_type: 'cash' | 'bank_transfer' | 'upi' | 'cheque';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_email: string;
          category: string;
          description: string;
          amount: number;
          date: string;
          payment_type: 'cash' | 'bank_transfer' | 'upi' | 'cheque';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          user_email?: string;
          category?: string;
          description?: string;
          amount?: number;
          date?: string;
          payment_type?: 'cash' | 'bank_transfer' | 'upi' | 'cheque';
          updated_at?: string;
        };
      };
      merchants: {
        Row: {
          id: string;
          user_id: string;
          user_email: string;
          name: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          total_due: number;
          total_owe: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_email: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          total_due?: number;
          total_owe?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          user_email?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          total_due?: number;
          total_owe?: number;
          updated_at?: string;
        };
      };
      stock: {
        Row: {
          id: string;
          user_id: string;
          user_email: string;
          metal_type: 'gold' | 'silver';
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_email: string;
          metal_type: 'gold' | 'silver';
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          user_email?: string;
          metal_type?: 'gold' | 'silver';
          quantity?: number;
          updated_at?: string;
        };
      };
    };
  };
}
