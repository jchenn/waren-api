import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { UserController } from './modules/user/user.controller';
import { AppService } from './app.service';
import { QuantifyModule } from './modules/quantify/quantify.module';
import { StockModule } from './modules/stock/stock.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV === 'development' ? true : false,
        logging: process.env.NODE_ENV === 'production' ? false : true,
        migrationsRun: true,
        // migrations: ['./migrations/*.ts'],
      }),
      inject: [ConfigService],
    }),
    StockModule,
    QuantifyModule,
  ],
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule {}
