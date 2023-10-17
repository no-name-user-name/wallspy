import RateBox from "./RateBox";
import { OkxTicker } from "../../types/okx";
import { useEffect, useState } from "react";
import { fetchJSON } from "../../utils/Utils";


export default function RatesPanel(){

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

    return(
        <><div className="rates-panel">
            <div className="head row">
                <div className="logo-name">
                    <p>Wallet Activity</p>
                </div>
                <div className="sort-box">
                    <select disabled={true}>
                        <option>Sort A to Z</option>
                    </select>
                </div>

            </div>
            <div className="search-bar row">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input disabled={true} placeholder="Search"></input>
            </div>

            <div className="rates row">

                {
                rates.length!==0? rates.map((e)=>{
                    return <RateBox key={e.instId} data={e}/>
                }):null
            }

            </div>
        </div></>
    )
}