import { ConfigService } from '@nestjs/config';
export interface SupabaseClient {
    from: (table: string) => any;
    auth: any;
    storage: any;
    rpc: (fn: string, params?: any) => any;
}
export declare class SupabaseService {
    private configService;
    private supabase;
    private readonly logger;
    private initialized;
    constructor(configService: ConfigService);
    private initializeSupabase;
    getClient(): Promise<SupabaseClient | null>;
    isConfigured(): boolean;
}
