"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const seeder_service_1 = require("./seeder.service");
async function runSeeder() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const seeder = app.get(seeder_service_1.SeederService);
    try {
        await seeder.importAllDataFiles();
        console.log('✅ All data import completed successfully');
    }
    catch (error) {
        console.error('❌ Data import failed:', error);
    }
    finally {
        await app.close();
    }
}
runSeeder();
//# sourceMappingURL=seeder.cli.js.map