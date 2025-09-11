import { supabase } from '../lib/supabase';
import { User } from '../types';

export interface AuthUser {
  id: string;
  email: string;
  business_name: string;
  phone_number?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  businessName: string;
  phoneNumber?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export class AuthService {
  // Sign up a new user
  static async signUp(data: SignUpData): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      // Create auth user with email confirmation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            business_name: data.businessName,
            phone_number: data.phoneNumber || '',
          }
        }
      });

      console.log('Signup response:', { authData, authError });

      if (authError) {
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, error: 'Failed to create user' };
      }

      console.log('User email confirmed at:', authData.user.email_confirmed_at);

      // Always require email confirmation for new signups
      console.log('Email confirmation required');
      return {
        user: null,
        error: 'EMAIL_CONFIRMATION_REQUIRED',
      };
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred' };
    }
  }

  // Send welcome email (simple approach using mailto)
  static async sendWelcomeEmail(email: string, businessName: string): Promise<void> {
    try {
      // Create welcome email content
      const subject = encodeURIComponent('🎉 Welcome to TradeManager!');
      const body = encodeURIComponent(`
Hi ${businessName || 'there'}!

Welcome to TradeManager! 🎉

Thank you for joining our platform. You can now:

📊 Track your gold and silver trades
📈 View analytics and reports  
💰 Manage your business finances
📱 Access your data from anywhere

Get started by visiting: ${window.location.origin}/dashboard

Best regards,
The TradeManager Team
      `);

      // For now, we'll just log the email content
      // In a real app, you'd integrate with an email service
      console.log('Welcome email would be sent to:', email);
      console.log('Email content:', `
Subject: 🎉 Welcome to TradeManager!
To: ${email}

Hi ${businessName || 'there'}!

Welcome to TradeManager! 🎉

Thank you for joining our platform. You can now:

📊 Track your gold and silver trades
📈 View analytics and reports  
💰 Manage your business finances
📱 Access your data from anywhere

Get started by visiting: ${window.location.origin}/dashboard

Best regards,
The TradeManager Team
      `);

      // Optional: Open email client (commented out to avoid popup)
      // window.open(`mailto:${email}?subject=${subject}&body=${body}`);
      
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw error;
    }
  }

  // Sign in existing user
  static async signIn(data: SignInData): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      console.log('🔐 AuthService: Starting sign in for:', data.email);
      
      // Try direct sign in without timeout first
      console.log('🔐 AuthService: Attempting direct sign in...');
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      console.log('🔐 AuthService: Sign in response:', { authData: !!authData, authError });

      if (authError) {
        console.error('❌ AuthService: Sign in error:', authError.message);
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        console.error('❌ AuthService: No user in auth data');
        return { user: null, error: 'Failed to sign in' };
      }

      console.log('👤 AuthService: User authenticated, checking for existing profile...');
      
      // Check if user profile already exists by email
      const { data: existingProfile } = await supabase
        .from('users')
        .select('*')
        .eq('email', authData.user.email)
        .single();

      let profileData;
      if (existingProfile) {
        console.log('✅ AuthService: Found existing profile, using it');
        // Update the existing profile with the new user ID (for session management)
        const { data: updatedProfile, error: updateError } = await supabase
          .from('users')
          .update({ id: authData.user.id })
          .eq('email', authData.user.email)
          .select()
          .single();
        
        if (updateError) {
          console.error('❌ AuthService: Profile update error:', updateError.message);
          return { user: null, error: updateError.message };
        }
        profileData = updatedProfile;
      } else {
        console.log('👤 AuthService: Creating new profile...');
        // Create user profile
        const { data: newProfile, error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email || '',
            business_name: authData.user.user_metadata?.business_name || 'My Business',
            phone_number: authData.user.user_metadata?.phone_number || null,
          })
          .select()
          .single();

        if (profileError) {
          console.error('❌ AuthService: Profile creation error:', profileError.message);
          return { user: null, error: profileError.message };
        }
        profileData = newProfile;
      }

      console.log('✅ AuthService: Sign in successful');
      return {
        user: {
          id: profileData.id,
          email: profileData.email,
          business_name: profileData.business_name,
          phone_number: profileData.phone_number,
        },
        error: null,
      };
    } catch (error) {
      console.error('❌ AuthService: Unexpected sign in error:', error);
      return { user: null, error: 'An unexpected error occurred' };
    }
  }

  // Sign out current user
  static async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message || null };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      console.log('🔍 AuthService: Getting current user...');
      
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        console.log('❌ AuthService: No user found or error:', authError?.message || 'No user found');
        return { user: null, error: authError?.message || 'No user found' };
      }

      console.log('👤 AuthService: User found, fetching profile...');
      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        console.error('❌ AuthService: Error fetching user profile:', profileError.message);
        return { user: null, error: profileError.message };
      }

      console.log('✅ AuthService: User profile fetched successfully');
      return {
        user: {
          id: profileData.id,
          email: profileData.email,
          business_name: profileData.business_name,
          phone_number: profileData.phone_number,
        },
        error: null,
      };
    } catch (error) {
      console.error('❌ AuthService: Unexpected error:', error);
      return { user: null, error: 'An unexpected error occurred' };
    }
  }


  // Listen to auth state changes
  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Check if user profile exists, create if not
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!existingUser) {
          // Create user profile for confirmed users
          await supabase
            .from('users')
            .insert({
              id: session.user.id,
              email: session.user.email || '',
              business_name: session.user.user_metadata?.business_name || 'My Business',
              phone_number: session.user.user_metadata?.phone_number || null,
            });
        }

        const { user } = await this.getCurrentUser();
        callback(user);
      } else if (event === 'SIGNED_OUT') {
        callback(null);
      }
    });
  }
}
