import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { UserController } from './modules/user/user.controller';
import { AppService } from './app.service';
import { QuantifyModule } from './modules/quantify/quantify.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    QuantifyModule,
  ],
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule {}
