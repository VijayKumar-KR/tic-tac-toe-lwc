import { LightningElement } from 'lwc';
// logo-Image
import salesforce_img from '@salesforce/resourceUrl/salesforce_img'; 
import linkedin_img from '@salesforce/resourceUrl/linkedin_img';
import wordpress_img from '@salesforce/resourceUrl/wordpress_img';
import insta_img from '@salesforce/resourceUrl/insta_img';
import facebook_img from '@salesforce/resourceUrl/facebook_img';
import twitter_img from '@salesforce/resourceUrl/twitter_img';
// logo-Image
import logo_img from '@salesforce/resourceUrl/logo_img'; 
// navigation
import { NavigationMixin } from 'lightning/navigation';

export default class HomeFooter extends NavigationMixin (LightningElement) {
    
    // logo
    logo_img = logo_img
    
    // socail media icons
    iconsList = [
                    {'dataid': "/", 'src' : salesforce_img, 'alt' : 'Salesforce'},
                    {'dataid': "https://www.linkedin.com/in/vijaykumarkr/", 'src' : linkedin_img,   'alt' : 'LinkedIn'},
                    {'dataid': "https://sfdcchampion4u.wordpress.com/", 'src' : wordpress_img,  'alt' : 'WordPress'},
                    {'dataid': "https://www.instagram.com/veee__jay/", 'src' : insta_img,      'alt' : 'Instagram'},
                    {'dataid': "https://www.facebook.com", 'src' : facebook_img,   'alt' : 'FaceBook'},
                    {'dataid': "https://www.twitter.com", 'src' : twitter_img,    'alt' : 'Twitter'}
                ]

    // navigate to webpage
    handleClickSocialIcon(event){
        console.log('url: ', event.currentTarget.getAttribute("data-id"));
        let url = event.currentTarget.getAttribute("data-id");
        const config = {
            type: 'standard__webPage',
            attributes: {
                url: url
            }
        };
        this[NavigationMixin.Navigate](config);
        
    }

}