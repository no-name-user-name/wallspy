import React from "react";
import { useEffect, useState } from "react"


import '../../assets/css/OrderBook.css';
import { fetchJSON } from "../../utils/Utils";
import { ENDPOIN } from "../../settings";

interface PaymentMethod{
    code: string,
    name: string,
    origin_name_locale: string,
    name_eng: string
}

interface UserData{
    avatar_code: string,
    nickname: string,
    userId: number,
    statistics: UserStats

}

interface UserStats{
    success_percent: number,
    success_rate: string,
    total_orders_count: number,
    user_id: number,
}

interface MarketOffer{
    id: number,
    number: string,
    type: 'SALE' | 'PURCHASE',
    available_volume: number,
    base_currency_code: string,
    quote_currency_code: string,
    price_type: string,
    price: number,
    profit_percent: null,
    min_order_amount: number,
    max_order_amount: number,
    max_order_volume: number,
    payment_method: PaymentMethod,
    user: UserData,
}

interface MarketPack{
	asks: MarketOffer,
	bids: MarketOffer,
}

interface BookRow{
    volume: number,
    offers: MarketOffer[]
}

interface BookData{
    [key: number]: BookRow
}


export default function OrderBook() {
    const [marketBids, setMarketBids] = useState<MarketOffer[]>([]);
    const [marketAsks, setMarketAsks] = useState<MarketOffer[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {

            fetchJSON(ENDPOIN + '/api/v1/market/offers')
            .then(data => {
                setMarketBids(data.bids)
                setMarketAsks(data.asks)
            }) 

        }, 5000);
        return () => clearInterval(interval);
    }, []);

    let bids_book = {} as BookData
    let asks_book = {} as BookData
  
    let biggest = 0
  
    for (var i=0; i < marketBids.length; i++) {
        let row = marketBids[i]
        if (bids_book.hasOwnProperty(row.price)){
            bids_book[row.price]['volume'] += row.available_volume
            bids_book[row.price]['offers'].push(row)
        }
        else{
            bids_book[row.price] = {} as BookRow
            bids_book[row.price]['volume'] = row.available_volume
            bids_book[row.price]['offers'] = [row]
        }       
      }
  
    for (var i=0; i < marketAsks.length; i++) {
        let row = marketAsks[i]
        if (asks_book.hasOwnProperty(row.price)){
            asks_book[row.price]['volume'] += row.available_volume
            asks_book[row.price]['offers'].push(row)
        }
        else{
            asks_book[row.price] = {} as BookRow
            asks_book[row.price]['volume'] = row.available_volume
            asks_book[row.price]['offers'] = [row]
        } 
    }

    Object.keys(asks_book).sort().reverse().slice(0,18).map(function(i){
        const key = parseFloat(i)
        if (asks_book[key]['volume'] > biggest){
            biggest = asks_book[key].volume
        }
    })
    Object.keys(bids_book).sort().slice(0,18).map(function(i){
        const key = parseFloat(i)
        if (bids_book[key].volume > biggest){
            biggest = bids_book[key].volume
        }
    })    

    return (
        <div className="main_book">

            <div className="book_panel">
                <div className="panel_decorate margin_little green_header">Bids</div>

                <div className="book_panel_2 panel_decorate panel_info">
                    <div className="book_table">Summary</div>
                    <div className="book_table">Value (TON)</div>
                    <div className="book_table">Price (RUB)</div>
                </div>

                {
                    Object.keys(bids_book).sort().slice(0,18).map(function(i){
                        const key = parseFloat(i)

                        let w = bids_book[key].volume/biggest*100
                        if (w < 50){
                            w = w + w * 0.2
                        }
                        return (
                            <div className="book_panel_2 panel_decorate">
                                <div className="book_table">-</div>
                                <div className="book_table">{bids_book[key].volume.toFixed(2)}</div>
                                <div className="book_table">{parseFloat(i).toFixed(2)}</div>
                                <div className="filler_green" style={{ width: w + '%'}}></div>
                            </div>)
                    })
                }

            </div>

            <div className="book_panel">
                <div className="panel_decorate margin_little red_header">Asks</div>
                <div className="book_panel_2 panel_decorate panel_info">
                    <div className="book_table">Price (RUB)</div>
                    <div className="book_table">Value (TON)</div>
                    <div className="book_table">Summary</div>
                </div>

                {
                    Object.keys(asks_book).sort().reverse().slice(0,18).map(function(i){
                        const key = parseFloat(i)

                        let w = asks_book[key].volume/biggest*100
                        if (w < 50){
                            w = w + w * 0.2
                        }
                        return (
                            <div className="book_panel_2 panel_decorate">
                                <div className="book_table">{parseFloat(i).toFixed(2)}</div>
                                <div className="book_table">{asks_book[key].volume.toFixed(2)}</div>
                                <div className="book_table">-</div>
                                <div className="filler_red" style={{ width: w + '%'}}></div>
                            </div>)
                    })
                }
            </div>
        </div>
    );
}