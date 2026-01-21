import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Type definition for better TypeScript support
export interface SupabaseClient {
  from: (table: string) => any;
  auth: any;
  storage: any;
  rpc: (fn: string, params?: any) => any;
}

// Dynamic import function for Supabase
let supabaseCreateClient: any = null;

async function loadSupabase() {
  if (!supabaseCreateClient) {
    try {
      // Use require to avoid TypeScript compilation issues
      const supabase = eval('require')('@supabase/supabase-js');
      supabaseCreateClient = supabase.createClient;
    } catch (error) {
      console.warn('Supabase module not available:', error.message);
      return null;
    }
  }
  return supabaseCreateClient;
}

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient | null = null;
  private readonly logger = new Logger(SupabaseService.name);
  private initialized = false;

  constructor(private configService: ConfigService) {
    this.initializeSupabase();
  }

  private async initializeSupabase() {
    if (this.initialized) return;
    
    const supabaseUrl = this.configService.get<string>('app.supabase.url');
    const supabaseKey = this.configService.get<string>('app.supabase.anonKey');
    
    if (!supabaseUrl || !supabaseKey) {
      this.logger.warn('Supabase credentials not configured');
      this.initialized = true;
      return;
    }

    try {
      const createClient = await loadSupabase();
      if (createClient) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.logger.log('Supabase client initialized successfully');
      } else {
        this.logger.warn('Supabase module not available');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Supabase client:', error.message);
    }
    
    this.initialized = true;
  }

  async getClient(): Promise<SupabaseClient | null> {
    if (!this.initialized) {
      await this.initializeSupabase();
    }
    return this.supabase;
  }

  isConfigured(): boolean {
    return !!this.supabase;
  }
}