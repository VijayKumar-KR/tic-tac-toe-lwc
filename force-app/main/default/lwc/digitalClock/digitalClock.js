import { LightningElement, track } from 'lwc';
//background
import digitalclockback from '@salesforce/resourceUrl/digitalclockback';
// render templates
import digitalClock from './digitalClock.html';
import timeZoneModal from './timeZoneModal.html';

// worldtimeapi
const WORLD_API_URL = 'http://worldtimeapi.org';
// ipinfoapi
const IPINFO_API_URL = 'https://ipinfo.io';
// ipinfoapitoken
const IPINFO_API = 'cc10f9e8099421';
// countryFlags_API
const COUNTRY_FLAGS_API = 'https://countryflagsapi.com';

export default class DigitalClock extends LightningElement {

    // format
    checked = true;
    timeformat = 12;
    // Current User details
    @track ipinfo = {}
    // interval timer
    timer
    // tz
    timezones = []
    // options
    options = []
    // computer turn var
    timezone = 'Asia/Kolkata';
    // favlist
    favtimes = []
    // fav selection modal
    modalTemplate = false
    // selected timezone val from modal
    selectedFavTimeZoneList = []
    selectedTimeZoneObj = {}

    // set background image
    get backgroundStyle() {
        return `background-image:url(${digitalclockback})`;
    }

    // 12/24 format change
    handleChangeFormat(event){
        this.checked = !this.checked;
        this.timeformat = this.checked? 12 : 24;
        this.connectedCallback();
    }

    connectedCallback(){
        if(!this.options.length){
            this.getUserIp();
            this.getAllTimeZone();
        }
        this.timer = setInterval(() => {
            this.getCurrentDateTime();
        }, 1000);
    }

    // destroy timer
    disconnectedCallback() {
        clearInterval(this.timer);
    }

    // set to default TZ
    handleDefaultTz(){
        this.timezone = 'Asia/Kolkata';
    }

    // fetch current user ip details
    async getUserIp(){
        await fetch(IPINFO_API_URL+'?token='+IPINFO_API)
        .then(response => {
            if(response.ok) {
                return response.clone().json();
            } 
            else {
                throw Error(response);
            }
        })
        .then(ipinfo => {
            this.ipinfo = ipinfo;
            this.getCountryFlag(this.ipinfo.country);
        })
        .catch(error => console.log('error in getUserIp: ',error))
    }

    //
    async getCountryFlag(code){
        await fetch(COUNTRY_FLAGS_API+'/svg/'+code)
        .then(response => {
            console.log('response: ',response);
            if(response.ok) {
                console.log('response.blob(): ',response.blob());
                return response.blob();
            } 
            else {
                throw Error(response);
            }
        })
        .then(imageBlob => {
            console.log('imageBlob: ',imageBlob);
            // Then create a local URL for that image and print it 
    //   const imageObjectURL = URL.createObjectURL(imageBlob);
    //         console.log('flag: ',imageObjectURL);
    //         this.ipinfo.countryflag = imageObjectURL;
        })
        .catch(error => console.log('error in getCountryFlag: ',error))
    } 

    // fetch all timezone names
    async getAllTimeZone(){
        await fetch(WORLD_API_URL+'/api/timezone')
            .then(response => {
                if(response.ok) {
                    return response.clone().json();
                } 
                else {
                    throw Error(response);
                }
            })
            .then(timezone => {
                this.options = []
                timezone.forEach(ele => {
                    const option = { label: ele, value: ele};
                    this.options.push(option);
                }); 
                console.log('options: ', this.options);
            })
            .catch(error => console.log('error in getAllTimeZone: ',error))
    }

    handleModalPopUp(){
        this.selectedTimeZoneObj = {};
        this.modalTemplate = !this.modalTemplate;
    }

    // selected timezone value
    handleChangeLevel(event){
        let selectedtimezone = event.detail.value;
        this.selectedFavTimeZoneList.push(selectedtimezone)
        this.selectedTimeZoneObj = this.getFavTimes(selectedtimezone);
        console.log('selectedFavTimeZoneList: ', this.selectedFavTimeZoneList);
        console.log('selectedTimeZoneObj: ', this.selectedTimeZoneObj);
    }
    
    // set time and date
    getCurrentDateTime(){
        this.setDateTime('hour', 'min', 'sec', 'meridiem', this.timezone);
        this.favtimes = []
        if(this.selectedFavTimeZoneList){
            for (let i = 0; i < this.selectedFavTimeZoneList.length; i++) {
                this.favtimes.push(this.getFavTimes(this.selectedFavTimeZoneList[i]));
            }
            this.template.querySelector('c-fav-time-card').favtimeclocks(this.favtimes);
        }
    }

    updateFavTimeList(event){
        let index = event.detail;
        console.log('index: ', index);
        console.log('selectedFavTimeZoneList: ', this.selectedFavTimeZoneList);
        this.selectedFavTimeZoneList.splice(index, 1);
        console.log('AAA: ', this.selectedFavTimeZoneList);
        this.selectedFavTimeZoneList = [...this.selectedFavTimeZoneList];
    }

    setDateTime(hour_id, min_id, sec_id, meri_id, tz){
        let date = new Date(new Date().toLocaleString("en-US", {timeZone: tz}));
        // timestamp
        this.ipinfo.datetime = date.getTime();
        let h = date.getHours();
        // Convert 24hr into 12 and if 12PM % 12 then keep val as 12 instead 0
        let hrval
        if(h != 12){
            hrval = this.timeformat === 12 ? h % 12 : h;
        }else{
            hrval = 12;
        }  
        let meridiem = h < 12 ? 'AM' : 'PM'; 
        // hour
        this.template.querySelector('[data-id='+hour_id+']').textContent = this.getformat(hrval);
        // minute
        this.template.querySelector('[data-id='+min_id+']').textContent = this.getformat(date.getMinutes());
        // seconds
        this.template.querySelector('[data-id='+sec_id+']').textContent = this.getformat(date.getSeconds());
        //meridiem
        this.template.querySelector('[data-id='+meri_id+']').textContent = meridiem;
    }

    getFavTimes(tz){
        let date = new Date(new Date().toLocaleString("en-US", {timeZone: tz}));
        let h = date.getHours();
        // Convert 24hr into 12 and if 12PM % 12 then keep val as 12 instead 0
        let hrval
        if(h != 12){
            hrval = this.timeformat === 12 ? h % 12 : h;
        }else{
            hrval = 12;
        }   
        let meridiem = h < 12 ? 'AM' : 'PM'; 
        return {hour: this.getformat(hrval), 
                min: this.getformat(date.getMinutes()), 
                sec: this.getformat(date.getSeconds()), 
                tz: tz, 
                meri: meridiem,
                timestamp: date.getTime()};
    }

    // add 0 to single digit hour/minute
    getformat(val){
        return val < 10 ? '0'+val : val;
    }

    render() {
        return this.modalTemplate ? timeZoneModal : digitalClock;
    }
}