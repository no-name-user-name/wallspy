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

export {fetchJSON}


