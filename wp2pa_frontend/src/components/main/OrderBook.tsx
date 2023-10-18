import { useEffect, useState } from "react"

import '../../assets/css/OrderBook.css';
import { WS_ENDPOINT } from "../../settings";
import {BookRows, BookHead} from "../orderBook/BookRow";
import { MarketOffer, MarketPack } from "../../types/offers";


export default function OrderBook() {
    const [marketBids, setMarketBids] = useState<MarketOffer[]>([]);
    const [marketAsks, setMarketAsks] = useState<MarketOffer[]>([]);
    const [rowsCount, setRowsCount] = useState(10)
    const [topVolume, setTopVolume] = useState(0);


    useEffect(() => {
        const socket = new WebSocket(WS_ENDPOINT + '/ws/');
        let interval: NodeJS.Timer | null = null;
		
        socket.onopen = function() {
            interval = setInterval(()=>{
                const msg = {
                    "method": "ping"
                }
                this.send(JSON.stringify(msg))
            }, 15 * 1000)


			let msg = {
				"method": "market_subscribe"
			}
			this.send(JSON.stringify(msg))
		};

        socket.onmessage = function(event) {
			let json_data = JSON.parse(event.data)		

			if (json_data.hasOwnProperty('type')){
				if (json_data.type === 'market_subscribe'){
                    const data = json_data.data as MarketPack
                    
                    let asks = data.asks.slice(0, rowsCount)
                    let bids = data.bids.slice(0, rowsCount)

                    setMarketBids(bids)
                    setMarketAsks(asks)

                    let top = topVolume
                    for(const o of asks as MarketOffer[]){
                        if (o.available_volume > top){
                            top = o.available_volume
                        }
                    }
                    for(const o of bids as MarketOffer[]){
                        if (o.available_volume > top){
                            top = o.available_volume
                        }
                    }
                    setTopVolume(top)
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
        }
    }, [rowsCount])

    return (
        <>
        <div className="main_book">
            <div className="header">
                <p>Wallet Orders Book</p>
                <div>
                    <select onChange={(e) => {setRowsCount(parseInt(e.target.value))}} className="numrows">
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={30}>30</option>
                        <option value={100}>100</option>
                    </select>
                </div>
            </div>
            <div className="offers">
                <BookHead/>
                <div className="spliter"></div>

                <div className="book_asks">
                    <BookRows data={marketAsks} topVolume={topVolume} type='asks' />
                </div>
                <div className="spliter"></div>
                <div className="book_bids">
                    <BookRows data={marketBids} topVolume={topVolume} type='bids' />
                </div>
            </div>  
        </div>
        </>
    )
}