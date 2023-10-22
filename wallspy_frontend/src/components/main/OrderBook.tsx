
import React from "react";
import { MarketOfferRef } from "../../types/offers";
import {BookRows, BookHead} from "../orderBook/BookRow";

export default function OrderBook(props:{marketAsks:MarketOfferRef[], marketBids:MarketOfferRef[], rowsCount:number, setRowsCallback:React.Dispatch<React.SetStateAction<number>>}) {

    const setRowsCount = props.setRowsCallback
    const marketAsks = props.marketAsks
    const marketBids = props.marketBids
    const rowsCount = props.rowsCount
    
    return (
        <>
        <div className="main_book">
            <div className="head">
                <div className="header title">
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
            </div>
            <div className="offers">
                <BookHead/>
                <div className="spliter"></div>

                <div className="book_asks">
                    <BookRows asksOffers={marketAsks} bidsOffers={marketBids} count={rowsCount} type='asks' />
                </div>
                <div className="spliter"></div>
                <div className="book_bids">
                    <BookRows asksOffers={marketAsks} bidsOffers={marketBids}  count={rowsCount} type='bids' />
                </div>
            </div>  
        </div>
        </>
    )
}