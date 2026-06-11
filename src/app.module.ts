import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { createConnection } from 'mysql2/promise';
import { AppController } from './app.controller';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CartsModule } from './modules/carts/carts.module';
import { OrdersModule } from './modules/orders/orders.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { LogsModule } from './modules/logs/logs.module';
import { BannersModule } from './modules/banners/banners.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { AppService } from './app.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { OperationLogInterceptor } from './common/interceptors/operation-log.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function buildTypeOrmOptions(
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> {
  const host = configService.get<string>('DB_HOST') ?? 'localhost';
  const port = Number(configService.get<string>('DB_PORT') ?? 3306);
  const username = configService.get<string>('DB_USERNAME') ?? 'root';
  const password = configService.get<string>('DB_PASSWORD') ?? '123456';
  const database = configService.get<string>('DB_DATABASE') ?? 'nest_mall_local';

  const connection = await createConnection({
    host,
    port,
    user: username,
    password,
  });

  try {
    await connection.query(
      'CREATE DATABASE IF NOT EXISTS ?? DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci',
      [database],
    );
  } finally {
    await connection.end();
  }

  return {
    type: 'mysql',
    host,
    port,
    username,
    password,
    database,
    autoLoadEntities: true,
    synchronize: (configService.get<string>('DB_SYNCHRONIZE') ?? 'true') === 'true',
    logging: (configService.get<string>('DB_LOGGING') ?? 'false') === 'true',
    timezone: '+08:00',
  };
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: buildTypeOrmOptions,
    }),
    UsersModule,
    AuthModule,
    RbacModule,
    LogsModule,
    CategoriesModule,
    ProductsModule,
    BannersModule,
    UploadsModule,
    CartsModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: OperationLogInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
