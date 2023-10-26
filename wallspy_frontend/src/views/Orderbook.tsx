import Header from "../components/Header";
import OrderBook from "../components/main/OrderBook";
import '../assets/css/OrderBook.css';
import { useState, useEffect, createRef } from "react";
import { WS_ENDPOINT } from "../settings";
import { MarketOfferRef, MarketPack } from "../types/offers";
import PageLoader from "../components/pageLoader";

export default function Orderbook(){
    const [marketBids, setMarketBids] = useState<MarketOfferRef[]>([]);
    const [marketAsks, setMarketAsks] = useState<MarketOfferRef[]>([]);
    const [market, setMarket] = useState<MarketPack>()
    const [rowsCount, setRowsCount] = useState(10)
    const [animateBidsRef, setAnimateBidsRef] = useState<any>()
    const [animateAsksRef, setAnimateAsksRef] = useState<any>()

    useEffect(() => {
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
            socket.close()
            console.log('Ws closed')
        }
    }, [rowsCount])    


    function updateState(new_data:MarketOfferRef[], old_data:MarketOfferRef[], callback: React.Dispatch<React.SetStateAction<MarketOfferRef[]>>){
        let buff = [] as MarketOfferRef[]
        let toAnime: any[] = []
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
                                if (obj.nodeRef.current){
                                    toAnime.push(obj.nodeRef)
                                }
                                return {...obj, available_volume: row.availableVolume, price: row.price, user: row.user}
                            }   
                            return obj
                        })
                    )
                }
            }
            else{
                row.nodeRef = createRef()
                toAnime.push(row.nodeRef)
                buff.push(row)
            }
        })
        callback(current=> [...current, ...buff])
        return toAnime
    }

    useEffect(() => {
        if (market){
            setAnimateBidsRef(updateState(market.bids, marketBids, setMarketBids))    
            setAnimateAsksRef(updateState(market.asks, marketAsks, setMarketAsks))
        }
    }, [market])
    
    function aminate(refs: any[]){
        refs?.map((ref: any) => {
            if (ref.current){
                let prev_class = ref.current.className
                if (prev_class!== null){
                    ref.current.className = prev_class  + ' row_animate'
                    const i =setInterval(()=>{
                        setTimeout(()=>{
                            try {
                                ref.current.className = prev_class
                            } catch (error) {
                                console.log(error)
                            }
                           clearInterval(i) 
                        }, 1000)
                    }, 1000)
                }
            }
        })
    }

    useEffect(() => {     
        aminate(animateBidsRef)
      return () => {
      }
    }, [animateBidsRef])
        

    useEffect(() => {   
        aminate(animateAsksRef)   
      return () => {
      }
    }, [animateAsksRef])
    

    return(
    <>
        {
            marketAsks.length>0&&marketBids.length>0&&rowsCount?
            <><Header />
                <div className="container">
                <OrderBook
                        marketAsks={marketAsks}
                        marketBids={marketBids}
                        rowsCount={rowsCount}
                        setRowsCallback={setRowsCount} />

                </div></>:<PageLoader />
        }

    </>
);
}