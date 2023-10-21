import Header from "../components/Header";
import "../assets/css/RatesPanel.css"
import RatesPanel from "../components/main/RatesPanel";
import { useState, useEffect } from "react";
import { OkxTicker } from "../types/okx";
import { fetchJSON } from "../utils/Utils";
import PageLoader from "../components/pageLoader";


export default function Exchanges(){

    const [rates, setRates] = useState<OkxTicker[]>([])
 
    useEffect(() => {
        fetchJSON('https://www.okx.com/api/v5/market/tickers?instType=SPOT')
        .then(data => {
            let pick = [] as OkxTicker[]
            for (let e of data.data as OkxTicker[]){
                if ((e.instType === 'SPOT')&&(e.instId === 'TON-USDT')){
                    pick.push(e)
                }
                if ((e.instType === 'SPOT')&&(e.instId === 'BTC-USDT')){
                    pick.push(e)
                }
            }
            setRates(pick)
        })
    }, [])  


    return(<>
        {
            rates.length > 0 ? 
            <>
                <Header/>
                <div className="container">
                    <RatesPanel rates={rates}/>
                </div>
            
            </> : <><PageLoader/></>
        }

        
    </>);
}