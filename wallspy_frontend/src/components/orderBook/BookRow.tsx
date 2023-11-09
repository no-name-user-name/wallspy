import {
    CSSTransition,
    TransitionGroup,
} from 'react-transition-group';
import { MarketOfferRef } from "../../types/offers";
import { openLink } from '../../utils/Utils';

function getMark(total: number, percent: number, isVerified: Boolean){
    if (isVerified){
        return `${total} ✅`
    }
    if (percent > 93)
        if (total > 100){
            return `${total} 🔸`
        }
    if (total < 20){
        if (percent < 90){
            return `${total} ❌`
        }
    }
    return `${total} 🔸`
}

function BookRows(props: {asksOffers: MarketOfferRef[], bidsOffers: MarketOfferRef[],  type: 'asks' | 'bids', count: number}){
    let colorClass = 'green'
    let asks = props.asksOffers.slice(0, props.count).reverse()
    let bids = props.bidsOffers.slice(0, props.count).reverse()
    let data = [] as MarketOfferRef[]
    if (props.type === 'asks'){
        colorClass = 'red'
        data = asks.reverse()
    }
    else{
        data = bids
    }

    let topVolume = 0
    for(const o of asks as MarketOfferRef[]){
        if (o.availableVolume > topVolume){
            topVolume = o.availableVolume
        }
    }
    for(const o of bids as MarketOfferRef[]){
        if (o.availableVolume > topVolume){
            topVolume = o.availableVolume
        }
    }

    return(
        <>  
            <TransitionGroup className="action-block">
                {
                    data.map((row: MarketOfferRef) => (
                        <CSSTransition
                            key={row.id}
                            nodeRef={row.nodeRef}
                            timeout={1}
                            classNames="item">
                                
                                <div onClick={()=>{openLink(row.id, row.user.userId)}} ref={row.nodeRef} className="book_row panel_decorate">
                                    <div className={"book_table price " + colorClass}>{row.price.value.toFixed(2)}</div>
                                    <div className="book_table volume">{row.availableVolume.toFixed(2)}</div>
                                    <div className="book_table summary">{(row.price.value * row.availableVolume).toFixed(2)}</div>

                                    <div className="book_table user">
                                        <p>{row.user.nickname}</p>
                                    </div>
                                    <div className="book_table stats">
                                        {getMark(row.user.statistics.totalOrdersCount, row.user.statistics.successPercent, row.user.isVerified)}
                                    </div>
                                    <div className={props.type==='asks'?'filler_red':'filler_green'} 
                                    style={{ width: row.availableVolume/topVolume*100<50?row.availableVolume/topVolume*100+row.availableVolume/topVolume*100*5:row.availableVolume/topVolume*100 + '%'}}></div>
                                </div>

                        </CSSTransition>
                    ))
                }
            </TransitionGroup>
        </>
    )
}


function BookHead(){

    return(
        <div className="book_panel">
            <div className="book_panel_2 panel_decorate panel_info">
            <div className="book_table price">Price</div>
            <div className="book_table volume">Volume</div>
            <div className="book_table summary">Summary</div>
            <div className="book_table user">User</div>
            <div className="book_table stats">Stats</div>
            </div>
        </div>
    )
}



export {BookRows, BookHead}