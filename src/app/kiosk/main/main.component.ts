import { KioskService } from './../../shared/kiosk.service';
import { AlertService } from 'src/app/shared/alert.service';
import { Component, OnInit, NgZone, ViewChild ,Inject} from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ActivatedRoute, Router } from '@angular/router';
import * as mqttClient from '../../../vendor/mqtt';
import { MqttClient } from 'mqtt';
import * as Random from 'random-js';
import { CountdownComponent } from 'ngx-countdown';
import * as moment from 'moment';
import { ModalSelectPriorityComponent } from 'src/app/shared/modal-select-priority/modal-select-priority.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  @ViewChild('mdlSelectPriority') mdlSelectPriority: ModalSelectPriorityComponent;
  priority_id: any;
  priority_name: string;
  jwtHelper = new JwtHelperService();
  hn: any;
  vn: any;
  tabServicePoint = false;
  btnSelectServicePoint = false;
  tabProfile = true;
  servicePointList = [];
  token: any;
  hospname: any;
  isOffline = false;
  client: MqttClient;
  notifyUser = null;
  notifyPassword = null;
  notifyUrl: string;
  kioskId: any;
  isPrinting = false;

  cardCid: any;
  cardFullName: any;
  cardBirthDate: any;
  his: any;
  hisHn: any;
  hisPttype: any;
  hisFullName: any;
  hisBirthDate: any;

  rightName: any;
  rightStartDate: any;
  rightHospital: any;
  isSendAPIGET: any;
  isSendAPIPOST: any;
  urlSendAPIGET: any;
  urlSendAPIPOST: any;

  vaccine_history_1: any;
  vaccine_history_2: any;
  vaccine_history_3: any;
  vaccine_history_4: any;
  vaccine_history_5: any;
  vaccine_history_6: any;
  vaccine_history_7: any;
  vaccine_history_8: any;

  vaccine_date_1: any;
  vaccine_date_2: any;
  vaccine_date_3: any;
  vaccine_date_4: any;
  vaccine_date_5: any;
  vaccine_date_6: any;
  vaccine_date_7: any;
  vaccine_date_8: any;

  vaccine_place_1: any;
  vaccine_place_2: any;
  vaccine_place_3: any;
  vaccine_place_4: any;
  vaccine_place_5: any;
  vaccine_place_6: any;
  vaccine_place_7: any;
  vaccine_place_8: any;


  lab_name: any;
  lab_result: any;
  report_datetime: any;
  hospital_name: any;


  pid:any;
  claimType:any;
  hisMobile:any;
  correlationId:any;
  // hcode:any = this.apiHCode;
  local_code:any;

  item_claimType:any;

  item_read:any;

  @ViewChild(CountdownComponent) counter: CountdownComponent;

  constructor(
    private route: ActivatedRoute,
    private alertService: AlertService,
    private kioskService: KioskService,
    private zone: NgZone,
    private router: Router,
    @Inject('API_HCODE') private apiHCode: string) {
    this.route.queryParams
      .subscribe(params => {
        this.token = params.token || null;
      });
  }

  ngOnInit() {
    try {
      this.token = this.token || sessionStorage.getItem('token');
      if (this.token) {
        const decodedToken = this.jwtHelper.decodeToken(this.token);
        this.notifyUrl = `ws://${decodedToken.NOTIFY_SERVER}:${+decodedToken.NOTIFY_PORT}`;
        this.notifyUser = decodedToken.NOTIFY_USER;
        this.notifyPassword = decodedToken.NOTIFY_PASSWORD;
        this.kioskId = localStorage.getItem('kioskId') || '1';
        this.urlSendAPIGET = localStorage.getItem('urlSendVisitGet') ? localStorage.getItem('urlSendVisitGet') : null;
        this.urlSendAPIPOST = localStorage.getItem('urlSendVisitPost') ? localStorage.getItem('urlSendVisitPost') : null;
        this.isSendAPIGET = localStorage.getItem('isSendAPIGET') === 'Y' ? true : false;
        this.isSendAPIPOST = localStorage.getItem('isSendAPIPOST') === 'Y' ? true : false;
        this.initialSocket();
      } else {
        this.alertService.error('ไม่พบ TOKEN');
      }

    } catch (error) {
      console.log(error);
      this.alertService.serverError();
    }
  }
  async initialSocket() {
    // connect mqtt
    await this.connectWebSocket();
    await this.getInfoHospital();
    await this.getServicePoint();
  }

  onFinished() {
    console.log('Time finished!');
    this.connectWebSocket();
  }

  onNotify($event: any) {
    console.log('Finished');
  }

  connectWebSocket() {
    const rnd = new Random();
    const username = sessionStorage.getItem('username');
    const strRnd = rnd.integer(1111111111, 9999999999);
    const clientId = `${username}-${strRnd}`;

    try {
      this.client = mqttClient.connect(this.notifyUrl, {
        clientId: clientId,
        username: this.notifyUser,
        password: this.notifyPassword
      });
    } catch (error) {
      console.log(error);
    }

    const topic = `kiosk/${this.kioskId}`;

    const that = this;

    this.client.on('message', async (topic, payload) => {
      try {
        const _payload = JSON.parse(payload.toString());
        if (_payload.ok) {
          await this.setDataFromCard(_payload.results);
        } else {
          this.clearData();
        }
      } catch (error) {
        console.log(error);
      }

    });

    this.client.on('connect', () => {
      console.log(`Connected!`);
      that.zone.run(() => {
        that.isOffline = false;
      });

      that.client.subscribe(topic, { qos: 0 }, (error) => {
        if (error) {
          that.zone.run(() => {
            that.isOffline = true;
            try {
              that.counter.restart();
            } catch (error) {
              console.log(error);
            }
          });
        } else {
          console.log(`subscribe ${topic}`);
        }
      });
    });

    this.client.on('close', () => {
      console.log('MQTT Conection Close');
    });

    this.client.on('error', (error) => {
      console.log('MQTT Error');
      that.zone.run(() => {
        that.isOffline = true;
        that.counter.restart();
      });
    });

    this.client.on('offline', () => {
      console.log('MQTT Offline');
      that.zone.run(() => {
        that.isOffline = true;
        try {
          that.counter.restart();
        } catch (error) {
          console.log(error);
        }
      });
    });
  }

  async getInfoHospital() {
    try {
      const rs: any = await this.kioskService.getInfo(this.token);
      this.hospname = rs.info.hosname;
    } catch (error) {
      console.log(error);
      this.alertService.serverError();
    }
  }

  async getServicePoint() {
    try {
      const rs: any = await this.kioskService.getServicePoint(this.token);
      if (rs.statusCode === 200) {
        this.servicePointList = rs.results;
      }
    } catch (error) {
      console.log(error);
      this.alertService.serverError();
    }
  }

  async getPatient() {
    try {
      if (this.cardCid) {
        const rs: any = await this.kioskService.getPatient(this.token, { 'cid': this.cardCid });
        if (rs.statusCode === 200) {
          this.setDataFromHIS(rs.results);
        }
      }
    } catch (error) {
      console.log(error);
      this.alertService.serverError();
    }
  }


  onSelectServicePointList() {
    this.tabServicePoint = true;
    this.tabProfile = false;
  }

  cancel() {
    this.btnSelectServicePoint = true;
    this.tabServicePoint = false;
    this.tabProfile = true;
  }

  async setDataFromCard(data) {
    this.cardCid = data.cid;
    this.cardFullName = data.fullname;
    this.cardBirthDate = data.birthDate;
    if (this.cardCid) {
      await this.getPatient();
      // await this.getNhso(this.cardCid);
      await this.getLocalNhso();
      // await this.insertVaccine(this.cardCid);
      // await this.getVaccine(this.cardCid);

    } else {
      this.alertService.error('บัตรมีปัญหา กรุณาเสียบใหม่อีกครั้ง', null, 1000);
    }

  }

  async setDataFromHIS(data) {
    this.his = data;
    this.hisHn = data.hn;
    this.hisMobile = data.hometel.replace('-', '');
    this.hisPttype = data.namepttype;
    this.hisFullName = `${data.title}${data.firstName} ${data.lastName}`;
    this.hisBirthDate = data.birthDate;
    if (this.his) {
      await this.setTab();
    }
  }

  setTab() {
    if (+this.servicePointList.length <= 3) {
      this.btnSelectServicePoint = false;
      this.tabServicePoint = true;
    } else {
      this.btnSelectServicePoint = true;
    }
  }

  clearData() {
    this.cardCid = '';
    this.cardFullName = '';
    this.cardBirthDate = '';

    this.hisBirthDate = '';
    this.hisFullName = '';
    this.hisHn = '';
    this.hisMobile = '';

    this.rightName = '';
    this.rightStartDate = '';
    this.rightHospital = '';

    this.tabProfile = true;
    this.btnSelectServicePoint = false;
    this.tabServicePoint = false;


    this.vaccine_history_1 = '';
    this.vaccine_history_2 = '';
    this.vaccine_history_3 = '';
    this.vaccine_history_4 = '';
    this.vaccine_history_5 = '';
    this.vaccine_history_6 = '';
    this.vaccine_history_7 = '';
    this.vaccine_history_8 = '';

    this.vaccine_date_1 = '';
    this.vaccine_date_2 = '';
    this.vaccine_date_3 = '';
    this.vaccine_date_4 = '';
    this.vaccine_date_5 = '';
    this.vaccine_date_6 = '';
    this.vaccine_date_7 = '';
    this.vaccine_date_8 = '';

    this.vaccine_place_1 = '';
    this.vaccine_place_2 = '';
    this.vaccine_place_3 = '';
    this.vaccine_place_4 = '';
    this.vaccine_place_5 = '';
    this.vaccine_place_6 = '';
    this.vaccine_place_7 = '';
    this.vaccine_place_8 = '';

    this.lab_name = '';
    this.lab_result = '';
    this.report_datetime = '';
    this.hospital_name = '';
  }

  async print(queueId) {
    const printerId = localStorage.getItem('clientPrinterId');
    const printSmallQueue = localStorage.getItem('printSmallQueue') || 'N';
    const topicPrint = '/printer/' + printerId;

    const data = {
      queueId: queueId,
      topic: topicPrint,
      printSmallQueue: printSmallQueue
    };
    try {
      const rs: any = await this.kioskService.print(this.token, data);
      if (rs.statusCode === 200) {
        this.clearData();
      }
      this.isPrinting = false;
    } catch (error) {
      console.log(error);
      this.isPrinting = false;
      alert('ไม่สามารถพิมพ์บัตรคิวได้');
    }
  }

  async register(servicePoint) {
    this.isPrinting = true;
    const priorityId = this.priority_id || localStorage.getItem('kiosDefaultPriority');
    let data:any = {
      hn: this.his.hn,
      vn: 'K' + moment().format('x'),
      clinicCode: servicePoint.local_code,
      priorityId: priorityId,
      dateServ: moment().format('YYYY-MM-DD'),
      timeServ: moment().format('HHmm'),
      hisQueue: '',
      firstName: this.his.firstName,
      lastName: this.his.lastName,
      title: this.his.title,
      birthDate: this.his.engBirthDate,
      sex: this.his.sex
    };
    this.local_code = servicePoint.local_code;
    this.confirmSave();

    // try {
    //   const rs: any = await this.kioskService.register(this.token, data);
    //   if (rs.statusCode === 200) {
    //     if (rs.queueId) {
    //       await this.print(rs.queueId);
    //       this.clearData();
    //     }
    //   } else {
    //     this.alertService.error('ไม่สามารถลงทะเบียนได้');
    //     this.isPrinting = false;
    //   }

    // } catch (error) {
    //   this.isPrinting = false;
    //   console.log(error);
    // }

    try {

      const ovst: any = await this.kioskService.regisOvst(this.token, data);
      console.log('ovst : ',ovst);
      data.vn1 = await ovst.ovst[0];
      this.vn = await ovst.ovst[0];
      console.log('data : ',data);

      if (ovst.info != 'NO') {
        const rs: any = await this.kioskService.register(this.token, data);
        // console.log(rs);
        if (rs.statusCode = 200) {
          if (rs.queueId) {
            await this.print(rs.queueId);
            if (this.isSendAPIGET) {
              await this.kioskService.sendAPITRIGGER(this.token, 'GET', this.urlSendAPIGET, this.his.hn, this.cardCid, servicePoint.local_code, servicePoint.service_point_id);
            }
            if (this.isSendAPIPOST) {
              await this.kioskService.sendAPITRIGGER(this.token, 'POST', this.urlSendAPIPOST, this.his.hn, this.cardCid, servicePoint.local_code, servicePoint.service_point_id);
            }
          }
        } else {
          this.alertService.error('ไม่สามารถลงทะเบียนได้');
          this.isPrinting = false;
        }

      } else {
        this.alertService.error('มีการลงทะเบียนในระบบแล้ว ');
        this.isPrinting = false;
      }

    } catch (error) {
      this.isPrinting = false;
      console.log(error);
      this.alertService.error('ไม่สามารถลงทะเบียนได้ ');
    }
  }

  async confirmSave(){
    const data_confirm:any = {
      "pid": this.cardCid,
      "claimType": this.claimType || 'PG0060001',
      "mobile": `${this.hisMobile}`,
      "correlationId": `${this.correlationId}`,
      "hn": `${this.hisHn}`,
      "hcode": `${this.apiHCode}`
    }
    if(this.hisMobile && this.correlationId && this.hisMobile != 'ไม่มีเบอร์โทรศัพท์'){

      console.log('data_confirm :',data_confirm);
      try {
        const rs: any = await this.kioskService.getLocalNhsoConfirmSave(data_confirm);
        console.log('getLocalNhsoConfirmSave :',rs);

        const info_pttype:any = {
          cid:this.item_read.pid,
          json_data: JSON.stringify(this.item_read),
          claimCode:rs.claimCode,
          claimType:rs.claimType,
          cln:this.local_code,
          vn:this.vn,
          regist_date:moment().format('YYYY-MM-DD'),
          regist_time:moment().format('HH:mm:ss')
        }
        console.log('info_pttype :',info_pttype);

        if(rs.claimCode && rs.claimType){
          this.savePttypte(info_pttype);
        }
      } catch (error) {
        console.log(error.error);
        return false;
      }
    }

  }

  async savePttypte(info_pttype:any){
    try {
      const rs_info_pttype: any = await this.kioskService.getPttypte(this.token,info_pttype);
      console.log('getPttypte :',rs_info_pttype);
      return true;
    } catch (error) {
      console.log(error.error);
      return false;
    }
  }
  async getNhso(cid) {
    const nhsoToken = localStorage.getItem('nhsoToken');
    const nhsoCid = localStorage.getItem('nhsoCid');
    const data = `<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:tok=\"http://tokenws.ucws.nhso.go.th/\">\n   <soapenv:Header/>\n   <soapenv:Body>\n      <tok:searchCurrentByPID>\n         <!--Optional:-->\n         <user_person_id>${nhsoCid}</user_person_id>\n         <!--Optional:-->\n         <smctoken>${nhsoToken}</smctoken>\n         <!--Optional:-->\n         <person_id>${cid}</person_id>\n      </tok:searchCurrentByPID>\n   </soapenv:Body>\n</soapenv:Envelope>`;
    try {
      const nhso: any = {};
      const rs: any = await this.kioskService.getNhso(this.token, data);
      rs.results.forEach(v => {
        if (v.name === 'hmain') { nhso.hmain = v.elements[0].text; }
        if (v.name === 'hmain_name') { nhso.hmain_name = v.elements[0].text; }
        if (v.name === 'maininscl') { nhso.maininscl = v.elements[0].text; }
        if (v.name === 'maininscl_main') { nhso.maininscl_main = v.elements[0].text; }
        if (v.name === 'maininscl_name') { nhso.maininscl_name = v.elements[0].text; }
        if (v.name === 'startdate') { nhso.startdate = v.elements[0].text; }
        if (v.name === 'startdate_sss') { nhso.startdate_sss = v.elements[0].text; }
      });
      this.rightName = nhso.maininscl ? `${nhso.maininscl_name} (${nhso.maininscl})` : '-';
      this.rightHospital = nhso.hmain ? `${nhso.hmain_name} (${nhso.hmain})` : '-';
      this.rightStartDate = nhso.startdate ? `${moment(nhso.startdate, 'YYYYMMDD').format('DD MMM ')} ${moment(nhso.startdate, 'YYYYMMDD').get('year')}` : '-';
    } catch (error) {
      console.log(error);
      // this.alertService.error(error.message);
    }
  }

  async getLocalNhso(){
    try {
      let hosName:any;
      const rs: any = await this.kioskService.getLocalNhso();
      console.log(rs.startDateTime);

      if(rs.hospMain){
        hosName = rs.hospMain.hname;
      }else{
        hosName = null;
      }
      this.item_claimType = rs.claimTypes;
      this.correlationId = rs.correlationId;

      this.rightName = rs.mainInscl ? `(${rs.mainInscl})` : '-';
      this.rightHospital = hosName ? `(${rs.hospMain.hcode}) (${rs.hospMain.hname})` : '-';
      this.rightStartDate = rs.startDateTime ? `${moment(rs.startDateTime, 'YYYYMMDD').format('DD MMM ')} ${moment(rs.startDateTime, 'YYYYMMDD').get('year')}` : '-';
      this.item_read = rs;

    } catch (error) {
      console.log(error);
      // this.alertService.error(error.message);
    }
  }

  home() {
    this.router.navigate(['/admin/setting-kiosk']);

  }

  openPriority() {
    // this.patientName = `${visit.first_name} ${visit.last_name} (${visit.hn})`;
    // this.selectedVisit = visit;
    this.priority_name = 'ปกติ';
    this.mdlSelectPriority.open();
  }

  onSelectedPriority(priority: any) {
    this.priority_id = priority.priority_id || 1;
    this.priority_name = priority.priority_name;
    console.log(priority);

    // this.doRegister(priority.priority_id, this.selectedVisit);
  }

  async insertVaccine(cid:any){

    try {
      const rs_inserVac: any = await this.kioskService.insertVac(cid);
      // console.log(rs_inserVac);

    } catch (error) {
      console.log(error);
    }
  }


  async getVaccine(cid:any){

    try {
      const rs: any = await this.kioskService.selectVac(cid);

      console.log(rs);
      if(rs.info.result){
        let info = rs.info.result;
        if(info.vaccine_certificate[0]){
          if(info.vaccine_certificate[0].vaccination_list[0]){
            this.vaccine_history_1 = info.vaccine_certificate[0].vaccination_list[0].vaccine_name
            this.vaccine_date_1 = info.vaccine_certificate[0].vaccination_list[0].vaccine_date
            this.vaccine_place_1 = info.vaccine_certificate[0].vaccination_list[0].vaccine_place
          }
           if(info.vaccine_certificate[0].vaccination_list[1]){
            this.vaccine_history_2 = info.vaccine_certificate[0].vaccination_list[1].vaccine_name
            this.vaccine_date_2 = info.vaccine_certificate[0].vaccination_list[1].vaccine_date
            this.vaccine_place_2 = info.vaccine_certificate[0].vaccination_list[1].vaccine_place
          }
           if(info.vaccine_certificate[0].vaccination_list[2]){
            this.vaccine_history_3 = info.vaccine_certificate[0].vaccination_list[2].vaccine_name
            this.vaccine_date_3 = info.vaccine_certificate[0].vaccination_list[2].vaccine_date
            this.vaccine_place_3 = info.vaccine_certificate[0].vaccination_list[2].vaccine_place
          }
           if(info.vaccine_certificate[0].vaccination_list[3]){
            this.vaccine_history_4 = info.vaccine_certificate[0].vaccination_list[3].vaccine_name
            this.vaccine_date_4 = info.vaccine_certificate[0].vaccination_list[3].vaccine_date
            this.vaccine_place_4 = info.vaccine_certificate[0].vaccination_list[3].vaccine_place
          }
          if(info.vaccine_certificate[0].vaccination_list[4]){
            this.vaccine_history_5 = info.vaccine_certificate[0].vaccination_list[4].vaccine_name
            this.vaccine_date_5 = info.vaccine_certificate[0].vaccination_list[4].vaccine_date
            this.vaccine_place_5 = info.vaccine_certificate[0].vaccination_list[4].vaccine_place
          }
          if(info.vaccine_certificate[0].vaccination_list[5]){
            this.vaccine_history_6 = info.vaccine_certificate[0].vaccination_list[5].vaccine_name
            this.vaccine_date_6 = info.vaccine_certificate[0].vaccination_list[5].vaccine_date
            this.vaccine_place_6 = info.vaccine_certificate[0].vaccination_list[5].vaccine_place
          }
          if(info.vaccine_certificate[0].vaccination_list[6]){
            this.vaccine_history_7 = info.vaccine_certificate[0].vaccination_list[6].vaccine_name
            this.vaccine_date_7 = info.vaccine_certificate[0].vaccination_list[6].vaccine_date
            this.vaccine_place_7 = info.vaccine_certificate[0].vaccination_list[6].vaccine_place
          }
          if(info.vaccine_certificate[0].vaccination_list[7]){
            this.vaccine_history_8 = info.vaccine_certificate[0].vaccination_list[7].vaccine_name
            this.vaccine_date_8 = info.vaccine_certificate[0].vaccination_list[7].vaccine_date
            this.vaccine_place_8 = info.vaccine_certificate[0].vaccination_list[7].vaccine_place
          }

        }

        if(info.lab_test_results[0]){
          let dd:any = moment(info.lab_test_results[0].report_datetime).format('DD');
          let mm:any = moment(info.lab_test_results[0].report_datetime).format('MM');
          let y:any = moment(info.lab_test_results[0].report_datetime).format('YYYY');
          let yyyy:any = +y + 543;
          this.lab_name = info.lab_test_results[0].lab_name
          this.lab_result = info.lab_test_results[0].lab_result
          this.report_datetime = `${dd}/${mm}/${yyyy}`
          this.hospital_name = info.lab_test_results[0].hospital_name
        }


      }

    } catch (error) {
      console.log(error);
    }
  }

}
