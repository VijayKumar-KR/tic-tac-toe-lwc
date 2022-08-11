import { LightningElement, track } from 'lwc';
import digitalclockback from '@salesforce/resourceUrl/digitalclockback';
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

    // selected timezone value
    handleChangeLevel(event){
        this.timezone = event.detail.value;
    }

    selectedfavtz = []
    // set time and date
    getCurrentDateTime(){
        this.setDateTime('hour', 'min', 'sec', 'meridiem', this.timezone);
        this.selectedfavtz = ['America/Costa_Rica', 'America/Indiana/Marengo', 'Europe/Simferopol', 'Indian/Christmas', 'Pacific/Kosrae', 'Pacific/Wallis'];
        this.favtimes = []
        if(this.selectedfavtz.length){
            for (let i = 0; i < this.selectedfavtz.length; i++) {
                this.favtimes.push(this.getFavTimes(this.selectedfavtz[i]));
            }
            this.template.querySelector('c-fav-time-card').favtimeclocks(this.favtimes);
        }
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
}