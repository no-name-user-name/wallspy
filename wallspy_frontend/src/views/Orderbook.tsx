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
    const [animateBids, setAnimateBids] = useState<any>()
    const [animateAsks, setAnimateAsks] = useState<any>()

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
                    const market: MarketPack = json_data.data
                    setAnimateBids(updateState(market.bids, marketBids, setMarketBids))    
                    setAnimateAsks(updateState(market.asks, marketAsks, setMarketAsks))
                    // updateState(market.bids, marketBids, setMarketBids)  
                    // updateState(market.asks, marketAsks, setMarketAsks)
				}
			}
		};
    
        socket.onclose = function(event) {
            if (interval !== null){
                clearInterval(interval)
            }
		};

        return () => {
            socket.close()
            console.log('Ws closed')
            setMarketBids([])
            setMarketAsks([])
        }
    }, [fiat, currency])    

    function updateState(new_data:Offer[], old_data:Offer[], callback: React.Dispatch<React.SetStateAction<Offer[]>>){
        let buff = [] as Offer[]
        new_data.map((row)=>{
            var foundObject = old_data.filter(function(item) {
                return item.id === row.id;
            })[0];

            if (foundObject){
                if (row.availableVolume == 0){
                    callback(current => 
                        current.filter(obj => {
                            return obj.id !== row.id
                        })
                    )
                }
                else if ((foundObject.availableVolume !== row.availableVolume)||(foundObject.price !== row.price)||(foundObject.user !== row.user)) {
                    callback(current => 
                        current.map(obj => {
                            if (obj.id === row.id){
                                return {...obj, available_volume: row.availableVolume, price: row.price, user: row.user}
                            }   
                            return obj
                        })
                    )
                }
            }
            else{
                row.nodeRef = createRef()
                buff.push(row)
            }
        })
        callback(current=> [...current, ...buff])
    }   

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