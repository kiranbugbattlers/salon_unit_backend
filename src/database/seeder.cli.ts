import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeederService } from './seeder.service';

async function runSeeder() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(SeederService);

  try {
    // Import all data files from data/ directory
    await seeder.importAllDataFiles();
    
    console.log('✅ All data import completed successfully');
  } catch (error) {
    console.error('❌ Data import failed:', error);
  } finally {
    await app.close();
  }
}

runSeeder();
