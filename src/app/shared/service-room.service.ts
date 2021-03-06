import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ServiceRoomService {

  token: any;
  httpOptions: any;

  constructor(@Inject('API_URL') private apiUrl: string, private httpClient: HttpClient) {
    this.token = sessionStorage.getItem('token');
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.token
      })
    };
  }

  async list(servicePointId: any) {
    const _url = `${this.apiUrl}/service-rooms/${servicePointId}`;
    return this.httpClient.get(_url, this.httpOptions).toPromise();
  }

  async save(data: object) {
    const _url = `${this.apiUrl}/service-rooms`;
    return this.httpClient.post(_url, data, this.httpOptions).toPromise();
  }

  async update(roomId: any, data: object) {
    const _url = `${this.apiUrl}/service-rooms/${roomId}`;
    return this.httpClient.put(_url, data, this.httpOptions).toPromise();
  }

  async remove(roomId: any) {
    const _url = `${this.apiUrl}/service-rooms/${roomId}`;
    return this.httpClient.delete(_url, this.httpOptions).toPromise();
  }

}
