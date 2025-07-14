/* Uma maneira de controlar rotas usando environment variables
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  
  get apiUrl(): string {
    return environment.apiUrl || 'https://pfs-api.onrender.com';
  }
  
  get production(): boolean {
    return environment.production;
  }
  
  get environment() {
    return environment;
  }
}
*/

/*
import { ConfigService } from '../../services/config.service';
  constructor(private http: HttpClient, private configService: ConfigService) { }

`${this.configService.apiUrl}/...

*/