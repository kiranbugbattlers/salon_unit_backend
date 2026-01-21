import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService, SupabaseClient } from './supabase.service';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {}

  getDatabaseMode(): 'local' | 'supabase' {
    return this.configService.get<string>('app.dbMode') as 'local' | 'supabase';
  }

  isLocalMode(): boolean {
    return this.getDatabaseMode() === 'local';
  }

  isSupabaseMode(): boolean {
    return this.getDatabaseMode() === 'supabase';
  }

  getDatabaseConfig() {
    const dbMode = this.getDatabaseMode();
    
    if (dbMode === 'supabase') {
      const supabaseConfig = this.configService.get('app.supabase.database');
      this.logger.log('Using Supabase database configuration');
      return {
        ...supabaseConfig,
        mode: 'supabase',
        ssl: { rejectUnauthorized: false },
      };
    }
    
    const localConfig = this.configService.get('app.database');
    this.logger.log('Using local database configuration');
    return {
      ...localConfig,
      mode: 'local',
      ssl: false,
    };
  }

  async getSupabaseClient(): Promise<SupabaseClient | null> {
    if (this.isSupabaseMode()) {
      return await this.supabaseService.getClient();
    }
    return null;
  }

  validateConfiguration(): boolean {
    const dbMode = this.getDatabaseMode();
    
    if (dbMode === 'supabase') {
      const supabaseUrl = this.configService.get<string>('app.supabase.url');
      const supabaseKey = this.configService.get<string>('app.supabase.anonKey');
      const supabaseDbConfig = this.configService.get('app.supabase.database');
      
      if (!supabaseUrl || !supabaseKey || !supabaseDbConfig.host) {
        this.logger.error('Supabase configuration is incomplete. Please check your environment variables.');
        return false;
      }
    } else {
      const localConfig = this.configService.get('app.database');
      
      if (!localConfig.host || !localConfig.database) {
        this.logger.error('Local database configuration is incomplete. Please check your environment variables.');
        return false;
      }
    }
    
    return true;
  }
}