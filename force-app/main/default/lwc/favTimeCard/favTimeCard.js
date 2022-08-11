import { LightningElement, api } from 'lwc';

export default class FavTimeCard extends LightningElement  {
    @api favtimes = []

    @api 
    favtimeclocks(favtime){
        this.favtimes = favtime;
    }

    handleRemoveFavTime(){
        
    }
}