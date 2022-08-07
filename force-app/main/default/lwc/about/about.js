import { LightningElement, api } from 'lwc';

export default class About extends LightningElement {

    @api textArray = ['Salesforce Developer', 'Blogger', 'Enthusiastic', 'Ambitious']

    charIndex = 0;
    arrayIndex = 0;
    timer

    connectedCallback(){
        this.timer = setInterval(() => {
            this.displayText();
        }, 400);
    }

    // destroy timer
    disconnectedCallback() {
        clearInterval(this.timer);
    }

    displayText(){
        let text = this.textArray[this.arrayIndex];
        if(text){
            this.charIndex++;
            this.template.querySelector('[data-id=text').innerHTML = `<h1>I am ${(text.slice(0, 1) === 'E') || (text.slice(0, 1) === 'A')  ? 'an' : 'a'} ${text.slice(0, this.charIndex)} </h1>`;
            if(text.length === this.charIndex){
                this.arrayIndex++;
                this.charIndex = 0;
            }
        } else{
            this.arrayIndex = 0;
        }
    }
}