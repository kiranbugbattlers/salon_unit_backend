import { ConfigService } from '@nestjs/config';
import { SupabaseService, SupabaseClient } from './supabase.service';
export declare class DatabaseService {
    private configService;
    private supabaseService;
    private readonly logger;
    constructor(configService: ConfigService, supabaseService: SupabaseService);
    getDatabaseMode(): 'local' | 'supabase';
    isLocalMode(): boolean;
    isSupabaseMode(): boolean;
    getDatabaseConfig(): any;
    getSupabaseClient(): Promise<SupabaseClient | null>;
    validateConfiguration(): boolean;
}
