
import React, { FC } from "react";
import {BookRows, BookHead, BookRowsSkeleton} from "../orderBook/BookRow";
import { Offer } from "../../types/offers";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'

interface OrderBookProps{
    marketAsks: Offer[]
    marketBids:Offer[]
    fiatList: string[]
    currencyList: string[]
    rowsCount:number
    setRowsCallback: React.Dispatch<React.SetStateAction<number>>
    setCurrency: React.Dispatch<React.SetStateAction<string>>
    setFiat: React.Dispatch<React.SetStateAction<string>>
    defaultCurryncy: string,
    defaultFiat: string,
    defaultLimit: number
}

const OrderBook: FC<OrderBookProps> = ({
    marketAsks, 
    marketBids, 
    fiatList, 
    currencyList, 
    rowsCount, 
    setRowsCallback, 
    setCurrency, 
    setFiat, 
    defaultCurryncy, 
    defaultFiat,
    defaultLimit
}) => {
    
    return (
        <>
        <div className="main_book">
            <div className="head">
                <div className="header title">
                    <p>Wallet Orders Book</p>
                    
                        {
                            currencyList.length>0?
                                <>
                                    <div>
                                        <select defaultValue={defaultCurryncy} onChange={(e) => { setCurrency(e.target.value); } } className="numrows">
                                            {currencyList.map((e: string, i) => (
                                                <option key={i} value={e}>{e}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <select defaultValue={defaultFiat} onChange={(e) => { setFiat(e.target.value); } } className="numrows">
                                            {fiatList.map((e: string, i) => (
                                                <option key={i} value={e}>{e}</option>
                                            ))}
                                        </select>
                                    </div><div>
                                        <select defaultValue={defaultLimit} onChange={(e) => { setRowsCallback(parseInt(e.target.value)); } } className="numrows">
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={30}>30</option>
                                        </select>
                                    </div>
                                </>
                            :
                            <div style={{flex:1, padding:"0 0px 0 25px"}}>
                                <SkeletonTheme height={'30px'} baseColor="#202020" highlightColor="#444" inline={true}>
                                    <Skeleton/>
                                </SkeletonTheme>
                            </div>
                        }
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
        </>
    )
}

export default OrderBook