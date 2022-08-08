import { LightningElement, track } from 'lwc';
import digitalclockback from '@salesforce/resourceUrl/digitalclockback';
// worldtimeapi
const WORLD_API_URL = 'http://worldtimeapi.org';
// ipinfoapi
const IPINFO_API_URL = 'https://ipinfo.io';
// ipinfoapitoken
const IPINFO_API = 'cc10f9e8099421';

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
    defaultTz = 'Asia/Kolkata';
    
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
            this.setTimeout();
        }, 1000);
    }

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
        })
        .catch(error => console.log('error in getUserIp: ',error))
    }

    // destroy timer
    disconnectedCallback() {
        clearInterval(this.timer);
    }

    get backgroundStyle() {
        return `background-image:url(${digitalclockback})`;
    }

    setTimeout(){
        let date = new Date();
        // timestamp
        this.ipinfo.datetime = date.getTime();
        let h = date.getHours();
        // Convert 24hr into 12 and if 12PM % 12 then keep val as 12 instead 0
        let hrval
        if(h != 12)
        hrval = this.timeformat === 12 ? h % 12 : h;
        // hour
        this.template.querySelector('[data-id=hour]').textContent = this.getformat(hrval);
        // minute
        this.template.querySelector('[data-id=min]').textContent = this.getformat(date.getMinutes());
        // seconds
        this.template.querySelector('[data-id=sec]').textContent = this.getformat(date.getSeconds());
        //meridiem
        let meridiem = h < 12 ? 'AM' : 'PM';
        this.template.querySelector('[data-id=meridiem]').textContent = meridiem;
    }

    getformat(val){
        return val < 10 ? '0'+val : val;
    }
}