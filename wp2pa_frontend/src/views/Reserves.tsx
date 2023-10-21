import Header from "../components/Header";
import ReservesPanel from "../components/main/ReservesPanel";
import '../assets/css/reserves.css';
import { useState, useEffect } from "react";
import { ENDPOIN } from "../settings";
import { ActivityStats } from "../types/activity";
import { OkxTicker } from "../types/okx";
import { fetchJSON } from "../utils/Utils";
import PageLoader from "../components/pageLoader";
import { TxPeriodData } from "../types/txs";

export default function Reserves(){
    const [balance, setBalance] = useState<number>()
    const [tokenPrice, setTokenPrice] = useState<number>()
    const [balanceDelta, setBalanceDelta] = useState<ActivityStats>()
    const [periodData, setPeriodData] = useState<TxPeriodData>()

    useEffect(() => {
        fetchJSON('https://toncenter.com/api/v2/getWalletInformation?address=EQBDanbCeUqI4_v-xrnAN0_I2wRvEIaLg1Qg2ZN5c6Zl1KOh')
        .then(data => {
            setBalance(data.result['balance'])
        })
        fetchJSON('https://www.okx.com/api/v5/market/ticker?instId=TON-USDT-SWAP')
        .then(result => {
            const tick = result.data[0] as OkxTicker
            setTokenPrice(parseFloat(tick.last))
        })
        fetchJSON(ENDPOIN + '/api/v1/market/actions/stats/')
        .then(result => {
            setBalanceDelta(result.data)
        })
        fetchJSON(ENDPOIN + '/api/v1/txs/?period=30d')
        .then(result => {
            console.log(result)
            setPeriodData(result)
        })
    }, [])   
    


    return(
        <>
        {
            balance&&tokenPrice&&balanceDelta&&periodData?
                <><Header />
                    <div className="container">
                        <ReservesPanel balance={balance} tokenPrice={tokenPrice} balanceDelta={balanceDelta} periodData={periodData}/>
                    </div></>:<PageLoader/>
        }
        </>
    );
}