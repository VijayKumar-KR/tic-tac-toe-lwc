import {api, LightningElement } from 'lwc';

export default class CustomLookup extends LightningElement {

    @api searchPlaceholder = "Search Timezone...";
    @api isValueSelected;
    @api options = []
    searchTerm;
    filterValues = []

    //CSS
    boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
    inputClass = '';

    connectedCallback(){
        this.backUpOptions = this.options;
    }

    handleClick() {
        this.searchTerm = '';
        this.inputClass = 'slds-has-focus';
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus slds-is-open';
    }

    onSelect(event) {
        this.selectedTz = event.currentTarget.dataset.name;
        const tzSelectedEvent = new CustomEvent('tzselected', {
            detail: {
                selectedTz: this.selectedTz,
            }});
        this.dispatchEvent(tzSelectedEvent);
        this.isValueSelected = true;
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
    }

    handleRemovePill() {
        this.isValueSelected = false;
        const removeTzEvent = new CustomEvent('removetimezone');
        this.dispatchEvent(removeTzEvent);
    }
    
    onChange(event) {
        this.options = this.backUpOptions;
        this.searchTerm = event.target.value;
        this.filterValues = []
        for (var i=0; i<this.options.length; i++) {
            let value = this.options[i].value;
            if(value.toLowerCase().includes(this.searchTerm.toLowerCase())){
                this.filterValues.push({label : this.options[i].value, value : this.options[i].value});
            }
        }
        this.options = this.filterValues;
    }

}