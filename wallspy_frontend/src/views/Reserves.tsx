import Header from "../components/Header";
import '../assets/css/reserves.css';
import { useState, useEffect } from "react";
import { ENDPOIN } from "../settings";
import { ActivityStats } from "../types/activity";
import { OkxTicker } from "../types/okx";
import { fetchJSON } from "../utils/Utils";
import { TopTx, Tx, TxPeriodData } from "../types/txs";
import { TopAddress, TopAddressSkeleton } from "../components/reserves/TopAddress";
import ReservesChart from "../components/reserves/ReservesChart";
import Balance from "../components/reserves/Balance";

export default function Reserves(){
    const [top, setTop] = useState<TopTx>()
    const [balance, setBalance] = useState<number>(0)
    const [tokenPrice, setTokenPrice] = useState<number>(0)
    const [balanceDelta, setBalanceDelta] = useState<ActivityStats>()

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
        fetchJSON(ENDPOIN + '/api/v1/txs/top')
        .then(result => {
            setTop(result.data)
        })
    }, [])   
    
    return(
        <>
            <Header />
            <div className='container'>
            <div className="res-block">
                <div className='head'>
                    <div  className="header title">
                        <p>Wallet Reserves</p>
                    </div> 
                </div>
                
                <Balance balance={balance} tokenPrice={tokenPrice} balanceDelta={balanceDelta}/>
                <ReservesChart/>
            </div>
        </div>
        
        <div className='container'>
            <div className='head'>
                <div  className="header title">
                    <p>Top deposits per day</p>
                </div>
            </div> 
            {
                top?
                    top.income.map((el: Tx, i:number)=>
                        <TopAddress key={'income-' + el.addr} el={el}/>
                    )
                    :
                    <TopAddressSkeleton/>
            }
        </div>
        
        <div className='container'>
            <div className='head'>
                <div  className="header title">
                    <p>Top withdrawals per day</p>
                </div>
            </div> 
            {
                top?
                top.outcome.map((el: Tx, i:number)=>
                    <TopAddress key={'outcome-' + el.addr} el={el}/>
                )
                :
                <TopAddressSkeleton/>
            }
        </div>
        </>
    );
}