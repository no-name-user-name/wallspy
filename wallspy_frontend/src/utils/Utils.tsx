import { ENDPOIN } from "../settings";
import { Offer } from "../types/offers";

async function fetchJSON(url: string, method='GET', json_data=null) {   
    let headers = {
        'Content-type': 'application/json',
    }
    
    try {
        const response = await fetch(url,{
            body: json_data===null?null:JSON.stringify(json_data),
            method: method,
            headers:headers,
        });

        let data: any = null

        try {
            data = await response.json();
        } catch (error) {
            console.log('JSON Error: ' + error)
            return undefined
        }

        if (response.ok){
            return data;
        }
        else{
            console.log('Fetch error. Code status: ' + response.status)
        }
    } catch (error) {
        console.log('Fetch fatal error ' + error)
        return undefined
    }

}

function timeToLocal(originalTime: number) {
    const d = new Date(originalTime * 1000);
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()) / 1000;
}

function openLink(id: number, user_id: number){
    window.Telegram.WebApp.HapticFeedback.notificationOccurred('success')
    let url = `https://t.me/wallet?startattach=offerid_${id}_${user_id}`
    window.Telegram.WebApp.openTelegramLink(url)
}

function dayPercent(open: number, current: number){
    let result = ((open-current)/current*100 * -1)
    return result >= 0? '+' + result.toFixed(2) + '%' : '' + result.toFixed(2) + '%'
}

function sortByPrice(data: Offer[], reverse: boolean = false){
    let sortedData;

    sortedData = data.sort(function(a,b){
        let x = a.price
        let y = b.price
        if (!reverse){
            if(x>y){return 1;}
            if(x<y){return -1;}
            return 0;
        }
        else{
            if(x<y){return 1;}
            if(x>y){return -1;}
            return 0;
        }
        
    });
    return sortedData;
}



function setCookie(name: string, value: string, daysToLive: number) {
    // Encode value in order to escape semicolons, commas, and whitespace
    var cookie = name + "=" + encodeURIComponent(value);
    
    if(typeof daysToLive === "number") {
        /* Sets the max-age attribute so that the cookie expires
        after the specified number of days */
        cookie += "; max-age=" + (daysToLive*24*60*60);
        
        document.cookie = cookie;
    }
}

function getCookie(name: string) {
    // Split cookie string and get all individual name=value pairs in an array
    var cookieArr = document.cookie.split(";");
    
    // Loop through the array elements
    for(var i = 0; i < cookieArr.length; i++) {
        var cookiePair = cookieArr[i].split("=");
        
        /* Removing whitespace at the beginning of the cookie name
        and compare it with the given string */
        if(name == cookiePair[0].trim()) {
            // Decode the cookie value and return
            return decodeURIComponent(cookiePair[1]);
        }
    }
    
    // Return null if not found
    return null;
}

export {fetchJSON, timeToLocal, openLink, dayPercent, sortByPrice, setCookie, getCookie}



