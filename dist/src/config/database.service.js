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
var DatabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_service_1 = require("./supabase.service");
let DatabaseService = DatabaseService_1 = class DatabaseService {
    constructor(configService, supabaseService) {
        this.configService = configService;
        this.supabaseService = supabaseService;
        this.logger = new common_1.Logger(DatabaseService_1.name);
    }
    getDatabaseMode() {
        return this.configService.get('app.dbMode');
    }
    isLocalMode() {
        return this.getDatabaseMode() === 'local';
    }
    isSupabaseMode() {
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
    async getSupabaseClient() {
        if (this.isSupabaseMode()) {
            return await this.supabaseService.getClient();
        }
        return null;
    }
    validateConfiguration() {
        const dbMode = this.getDatabaseMode();
        if (dbMode === 'supabase') {
            const supabaseUrl = this.configService.get('app.supabase.url');
            const supabaseKey = this.configService.get('app.supabase.anonKey');
            const supabaseDbConfig = this.configService.get('app.supabase.database');
            if (!supabaseUrl || !supabaseKey || !supabaseDbConfig.host) {
                this.logger.error('Supabase configuration is incomplete. Please check your environment variables.');
                return false;
            }
        }
        else {
            const localConfig = this.configService.get('app.database');
            if (!localConfig.host || !localConfig.database) {
                this.logger.error('Local database configuration is incomplete. Please check your environment variables.');
                return false;
            }
        }
        return true;
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = DatabaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        supabase_service_1.SupabaseService])
], DatabaseService);
//# sourceMappingURL=database.service.js.map