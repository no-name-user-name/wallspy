async function fetchJSON(url: string, method='GET', json_data=null) {
    let headers = {
        'Content-type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
        }

    try {
        const response = await fetch(url,{
        body: json_data===null?null:JSON.stringify(json_data),
        method: method,
        headers:headers
        });
        const data = await response.json();

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
    let url = `https://t.me/wallet?startattach=offerid_${id}_${user_id}`
    window.open(url, '_blank');
}

function dayPercent(open: number, current: number){
    let result = ((open-current)/current*100 * -1)
    return result >= 0? '+' + result.toFixed(2) + '%' : '' + result.toFixed(2) + '%'
}

export {fetchJSON, timeToLocal, openLink, dayPercent}



