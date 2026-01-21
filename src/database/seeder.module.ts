import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import * as entities from './entities';

// Filter out enums and only include actual entity classes
const entityClasses = Object.values(entities).filter(
  (item): item is (new (...args: any[]) => any) => 
    typeof item === 'function' && item.constructor.name === 'Function'
);

@Module({
  imports: [
    TypeOrmModule.forFeature(entityClasses),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
