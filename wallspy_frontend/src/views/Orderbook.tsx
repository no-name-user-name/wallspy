import Header from "../components/Header";
import '../assets/css/orderbook.css';
import { useState, useEffect, createRef } from "react";
import { ENDPOIN, WS_ENDPOINT } from "../settings";
import { fetchJSON } from "../utils/Utils";
import { MarketPack, Offer } from "../types/offers";
import { BookHead, BookRows, BookRowsSkeleton } from "../components/orderBook/BookRow";
import ControlPanel from "../components/orderBook/ControlPanel";

type SubSetting = {
    limit: number
    currency: string
    fiat: string
}

const DefaultSubSetting: SubSetting = {
    limit: 10,
    currency: "TON",
    fiat: "RUB"
}

export default function Test(){
    const [marketBids, setMarketBids] = useState<Offer[]>([]);
    const [marketAsks, setMarketAsks] = useState<Offer[]>([]);
    const [market, setMarket] = useState<MarketPack>()

    const [currencyList, setCurrencyList] = useState<string[]>([])
    const [fiatList, setFiatList] = useState<string[]>([])

    const localData = localStorage.getItem('lastSubSettings')
    const settings = localData?JSON.parse(localData):DefaultSubSetting

    const [fiat, setFiat] = useState<string>(settings.fiat)
    const [currency, setCurrency] = useState<string>(settings.currency)
    const [rowsCount, setRowsCount] = useState(settings.limit)

    useEffect(() => {
        fetchJSON(ENDPOIN + '/api/v1/market/pairs/')
        .then(result => {
            setCurrencyList(result.data.crypto)
            setFiatList(result.data.fiat)
        })
    }, [])
    

    useEffect(() => {
        localStorage.setItem('lastSubSettings', JSON.stringify({
            limit: rowsCount,
            currency: currency,
            fiat: fiat
        }))

        let interval: NodeJS.Timer | null = null;
        const socket = new WebSocket(WS_ENDPOINT + '/ws/');
        
        socket.onopen = function() {
            interval = setInterval(()=>{
                const msg = {
                    "method": "ping"
                }
                this.send(JSON.stringify(msg))
            }, 15 * 1000)

			let msg = {
				"method": "market_subscribe",
                "limit": DefaultSubSetting.limit,
                "currency": currency,
                "fiat": fiat,
			}
			this.send(JSON.stringify(msg))
		};
        
        socket.onmessage = function(event) {
			let json_data = JSON.parse(event.data)		
			if (json_data.hasOwnProperty('type')){
				if (json_data.type === 'market_subscribe'){
                    setMarket(json_data.data)
				}
			}
		};
    
        socket.onclose = function(event) {
            if (interval !== null){
                clearInterval(interval)
            }

		};

        return () => {
            setMarket(undefined)            
            socket.close()
            console.log('Ws closed')
        }
    }, [fiat, currency])    

    function update(new_offers: Offer[], prev_offers: Offer[], setCallback: any){
        let buff: Offer[] = []
        if (new_offers.length !== 0){
            new_offers.map((bid)=>{
                let foundObject = prev_offers.filter(function(item) {
                    return item.id === bid.id;
                })[0];
                
                if (foundObject){
                    if (bid.availableVolume === 0){
                        // console.log('удаление')
                        setCallback((current: Offer[]) => current.filter((obj: { id: number; }) => obj.id !== bid.id))
                    }
                    else if ((foundObject.availableVolume !== bid.availableVolume)||(foundObject.price !== bid.price)||(foundObject.user !== bid.user)) {
                        // console.log('изменение')
                        setCallback((current: Offer[]) => 
                            current.map((obj: { id: number; }) => {
                                if (obj.id === bid.id){
                                    return {...obj, available_volume: bid.availableVolume, price: bid.price, user: bid.user}
                                }   
                                return obj
                            })
                        )
                    }
                }
                else{
                    // console.log('добавление')
                    bid.nodeRef = createRef()
                    buff.push(bid)
                }
            })
        }
        setCallback((current: Offer[])=> [...current, ...buff])
    }
        
    useEffect(() => {
        if (market){
            update(market.bids, marketBids, setMarketBids)
            update(market.asks, marketAsks, setMarketAsks)
        }
    }, [market])
    

    return(
        <>
            <Header/>
            <div className="container">
                <div className="main_book">
                    <div className="head">
                        <div className="header title">
                            <p>Wallet Orders Book</p>
                            <ControlPanel 
                            currencyList={currencyList} 
                            fiatList={fiatList} 
                            currency={currency} 
                            fiat={fiat} 
                            rowsCount={rowsCount} 
                            setCurrency={setCurrency} setFiat={setFiat} setRowsCount={setRowsCount}/>
                        </div>
                    </div>

                    <div className="offers">
                        <BookHead/>
                        <div className="spliter"></div>
                        <div className="book_asks">
                            {
                                marketAsks.length>0&&marketBids.length>0?
                                    <BookRows marketAsks={marketAsks} marketBids={marketBids} count={rowsCount} type='asks' />
                                    :
                                    <BookRowsSkeleton count={rowsCount}/>
                            }
                        </div>
                        <div className="spliter"></div>
                        <div className="book_bids">
                            {
                                marketAsks.length>0&&marketBids.length>0?
                                    <BookRows marketAsks={marketAsks} marketBids={marketBids} count={rowsCount} type='bids' />
                                    :
                                    <BookRowsSkeleton count={rowsCount}/>
                            }
                        </div>
                    </div>  
                </div>
            </div>
        </>
);
}