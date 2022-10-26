import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class KioskService {

  token: any;
  httpOptions: any;
  constructor(@Inject('API_URL') private apiUrl: string,@Inject('API_URL_REPORT') private apiUrlReport: string,@Inject('API_URL_NHSO') private apiUrlNhso: string, private httpClient: HttpClient) {
    this.token = sessionStorage.getItem('token');
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.token
      })
    };
  }

  async getInfo(token: any = null) {
    const _url = `${this.apiUrl}/info`;
    let _httpOptions = {};

    if (token) {
      _httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        })
      };
    } else {
      _httpOptions = this.httpOptions;
    }

    return this.httpClient.get(_url, _httpOptions).toPromise();
  }

  async getServicePoint(token: any = null) {
    const _url = `${this.apiUrl}/service-points/kios`;
    let _httpOptions = {};

    if (token) {
      _httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        })
      };
    } else {
      _httpOptions = this.httpOptions;
    }

    return this.httpClient.get(_url, _httpOptions).toPromise();
  }

  async print(token: any = null, data) {
    const _url = `${this.apiUrl}/print/queue/prepare/print`;
    let _httpOptions = {};

    if (token) {
      _httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        })
      };
    } else {
      _httpOptions = this.httpOptions;
    }

    return this.httpClient.post(_url, data, _httpOptions).toPromise();
  }

  async register(token: any = null, data) {
    const _url = `${this.apiUrl}/queue/register`;
    let _httpOptions = {};

    if (token) {
      _httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        })
      };
    } else {
      _httpOptions = this.httpOptions;
    }

    return this.httpClient.post(_url, data, _httpOptions).toPromise();
  }

  async getPatient(token: any = null, data) {
    const _url = `${this.apiUrl}/kiosk/patient/info`;
    let _httpOptions = {};
    if (token) {
      _httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        })
      };
    } else {
      _httpOptions = this.httpOptions;
    }
    return this.httpClient.post(_url, data, _httpOptions).toPromise();
  }

  async getPttypte(token: any = null, data) {
    const _url = `${this.apiUrl}/kiosk/saveKiosPttype`;
    let _httpOptions = {};
    if (token) {
      _httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        })
      };
    } else {
      _httpOptions = this.httpOptions;
    }
    return this.httpClient.post(_url, data, _httpOptions).toPromise();
  }

  async getNhso(token, data) {
    const _url = `${this.apiUrl}/kiosk/nhso`;
    let _httpOptions = {};
    if (token) {
      _httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        })
      };
    } else {
      _httpOptions = this.httpOptions;
    }
    return this.httpClient.post(_url, { data: data }, _httpOptions).toPromise();
  }

  async getLocalNhso() {
    const _url = `${this.apiUrlNhso}/smartcard/read?readImageFlag=false`;
    let _httpOptions = {};
      _httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          "Accept" : "/",
          // 'Authorization': 'Bearer ' + token
        })
      };

    return this.httpClient.get(_url,_httpOptions).toPromise();
  }

  async getLocalNhsoConfirmSave(datas:any) {
    const _url = `${this.apiUrlNhso}/nhso-service/confirm-save`;
    let _httpOptions = {};
      _httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          "Accept" : "/",
          // 'Authorization': 'Bearer ' + token
        })
      };

    return this.httpClient.post(_url,datas,_httpOptions).toPromise();
  }

  async sendAPITRIGGER(token, type, url, hn, cid, localCode, servicePointId) {
    const _url = `${this.apiUrl}/kiosk/trigger`;
    let _httpOptions = {};
    if (token) {
      _httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        })
      };
    } else {
      _httpOptions = this.httpOptions;
    }
    return this.httpClient.post(_url, { url, type, hn, cid, localCode, servicePointId }, _httpOptions).toPromise();
  }

  async test(token) {
    const _url = `${this.apiUrl}/kiosk/test`;
    let _httpOptions = {};
    if (token) {
      _httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        })
      };
    } else {
      _httpOptions = this.httpOptions;
    }
    return this.httpClient.post(_url, _httpOptions).toPromise();
  }

  async regisOvst(token: any = null, data) {
    console.log(data);

    const _url = `${this.apiUrl}/ovst/register`;
    let _httpOptions = {};

    if (token) {
      _httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        })
      };
    } else {
      _httpOptions = this.httpOptions;
    }

    return this.httpClient.post(_url, data, _httpOptions).toPromise();
  }

  async selectVac(cid: any) {
    // console.log(cid);
    const _url = `http://tscenter.moph.go.th/api/ubonprompt/ImmunizationTarget/person?cid=${cid}`;
    let _httpOptions = {};
      _httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJ1Ym9ucHJvbXB0IiwiaWF0IjoxNjU0MTQxNjQxLCJleHAiOjE5Njk3MTc2NDF9.l_RAWDh7JrEd2QCd4g1NvpdDVApuB4avkIC6R_aNreM'
        })
      };

    return this.httpClient.get(_url,_httpOptions).toPromise();
  }

  async insertVac(cid: any) {
    console.log(this.apiUrlReport);

    // console.log(cid);
    const _url = `${this.apiUrlReport}/covid_vaccine/mophic-lab/${cid}`;
    let _httpOptions = {};
      _httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer ' + token
        })
      };

    return this.httpClient.get(_url,_httpOptions).toPromise();
  }
}
