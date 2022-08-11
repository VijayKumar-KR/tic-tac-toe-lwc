import { LightningElement, api } from 'lwc';

export default class FavTimeCard extends LightningElement  {
    @api favtimes = []

    @api 
    favtimeclocks(favtime){
        this.favtimes = favtime;
    }

    handleRemoveFavTime(event){
        let index = event.target.dataset.index;

        // Creates the event with the favtimes data.
        const selectedEvent = new CustomEvent('removed', { detail: index });
        // Dispatches the event.
        this.dispatchEvent(selectedEvent);
    }
}