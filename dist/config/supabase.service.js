"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SupabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let supabaseCreateClient = null;
async function loadSupabase() {
    if (!supabaseCreateClient) {
        try {
            const supabase = eval('require')('@supabase/supabase-js');
            supabaseCreateClient = supabase.createClient;
        }
        catch (error) {
            console.warn('Supabase module not available:', error.message);
            return null;
        }
    }
    return supabaseCreateClient;
}
let SupabaseService = SupabaseService_1 = class SupabaseService {
    constructor(configService) {
        this.configService = configService;
        this.supabase = null;
        this.logger = new common_1.Logger(SupabaseService_1.name);
        this.initialized = false;
        this.initializeSupabase();
    }
    async initializeSupabase() {
        if (this.initialized)
            return;
        const supabaseUrl = this.configService.get('app.supabase.url');
        const supabaseKey = this.configService.get('app.supabase.anonKey');
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
            }
            else {
                this.logger.warn('Supabase module not available');
            }
        }
        catch (error) {
            this.logger.error('Failed to initialize Supabase client:', error.message);
        }
        this.initialized = true;
    }
    async getClient() {
        if (!this.initialized) {
            await this.initializeSupabase();
        }
        return this.supabase;
    }
    isConfigured() {
        return !!this.supabase;
    }
};
exports.SupabaseService = SupabaseService;
exports.SupabaseService = SupabaseService = SupabaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SupabaseService);
//# sourceMappingURL=supabase.service.js.map