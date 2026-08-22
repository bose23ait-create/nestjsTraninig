import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const seedService = app.get(SeedService);

  const seedName = process.argv[2];

  if (seedName === 'role') {
    await seedService.seedRoles();
  } else if (seedName === 'user') {
    await seedService.seedUsers();
  } else {
    console.log('Please specify role or user');
  }

  await app.close();
}

void bootstrap().catch((error: unknown) => {
  console.error('Seeding failed:', error);
  process.exitCode = 1;
});
