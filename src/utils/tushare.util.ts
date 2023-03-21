import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';

export interface TuShareModel {
  code: number;
  msg: string;
  data: any;
}

@Injectable()
export class TuShareService {
  @Inject(HttpService)
  private readonly httpService: HttpService;

  @Inject(ConfigService)
  private readonly configService: ConfigService;

  get(
    api_name: string,
    params?: any,
    fields?: string,
  ): Observable<AxiosResponse<TuShareModel>> {
    return this.httpService.post(
      'http://api.tushare.pro',
      {
        api_name,
        token: this.configService.get('TUSHARE_TOKEN'),
        params: params || {},
        fields: fields || '',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    // return this.httpService.get('http://localhost:3000/api/user/list');
  }
}
