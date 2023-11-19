import Header from "../components/Header";
import OrderBook from "../components/main/OrderBook";
import '../assets/css/OrderBook.css';
import { useState, useEffect, createRef } from "react";
import { ENDPOIN, WS_ENDPOINT } from "../settings";
import { fetchJSON } from "../utils/Utils";
import { MarketPack, Offer } from "../types/offers";

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

    useEffect(() => {

        if (market){
            let buff: Offer[] = []
            if (market.bids.length !== 0){
                market.bids.map((bid)=>{
                    let foundObject = marketBids.filter(function(item) {
                        return item.id === bid.id;
                    })[0];
                    
                    if (foundObject){
                        if (bid.availableVolume === 0){
                            console.log('удаление')
                            setMarketBids(current => current.filter((obj) => obj.id !== bid.id))
                        }
                        else if ((foundObject.availableVolume !== bid.availableVolume)||(foundObject.price !== bid.price)||(foundObject.user !== bid.user)) {
                            console.log('изменение')
                            setMarketBids(current => 
                                current.map(obj => {
                                    if (obj.id === bid.id){
                                        return {...obj, available_volume: bid.availableVolume, price: bid.price, user: bid.user}
                                    }   
                                    return obj
                                })
                            )
                        }
                    }
                    else{
                        console.log('добавление')
                        bid.nodeRef = createRef()
                        buff.push(bid)
                    }
                })
            }
            setMarketBids(current=> [...current, ...buff])
            
            let buff2: Offer[] = []
            if (market.asks.length !== 0){
                market.asks.map((bid)=>{
                    let foundObject = marketAsks.filter(function(item) {
                        return item.id === bid.id;
                    })[0];
                    
                    if (foundObject){
                        if (bid.availableVolume === 0){
                            console.log('удаление')
                            setMarketAsks(current => current.filter((obj) => obj.id !== bid.id))
                        }
                        else if ((foundObject.availableVolume !== bid.availableVolume)||(foundObject.price !== bid.price)||(foundObject.user !== bid.user)) {
                            console.log('изменение')
                            setMarketAsks(current => 
                                current.map(obj => {
                                    if (obj.id === bid.id){
                                        return {...obj, available_volume: bid.availableVolume, price: bid.price, user: bid.user}
                                    }   
                                    return obj
                                })
                            )
                        }
                    }
                    else{
                        console.log('добавление')
                        bid.nodeRef = createRef()
                        buff2.push(bid)
                        
                    }
                })
                setMarketAsks(current=> [...current, ...buff2])
            }
        }

      return () => {
      }
    }, [market])
    

    return(
        <>
            <Header/>
            <div className="container">
                <OrderBook
                    marketAsks={marketAsks}
                    marketBids={marketBids}
                    fiatList={fiatList}
                    currencyList={currencyList}
                    rowsCount={rowsCount}
                    setRowsCallback={setRowsCount} 
                    setFiat={setFiat}
                    setCurrency={setCurrency}
                    defaultCurryncy={currency}
                    defaultFiat={fiat}
                    defaultLimit={rowsCount}
                />
            </div>
        </>
);
}