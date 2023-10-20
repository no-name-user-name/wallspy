import {
    CSSTransition,
    TransitionGroup,
} from 'react-transition-group';
import { MarketOfferRef } from "../../types/offers";

function getMark(total: number, percent: number){
    if (percent > 93)
        if (total > 100){
            return `${total} 💚`
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
    // data = data.slice(0, props.count)
    // data = data.slice(0, props.count)
    // data = data.reverse()
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
        if (o.available_volume > topVolume){
            topVolume = o.available_volume
        }
    }
    for(const o of bids as MarketOfferRef[]){
        if (o.available_volume > topVolume){
            topVolume = o.available_volume
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
                                
                                <div ref={row.nodeRef} className="book_row panel_decorate">
                                    <div className={"book_table price " + colorClass}>{row.price.toFixed(2)}</div>
                                    <div className="book_table volume">{row.available_volume.toFixed(2)}</div>
                                    <div className="book_table summary">{(row.price * row.available_volume).toFixed(2)}</div>

                                    <div className="book_table user">
                                        <img width={15} className="Ava" alt="Ava" src={`https://walletbot.me/static/images/alias/${row.user.avatar_code}.svg`}/>
                                        <p className="nick" style={{margin: 0}}>{row.user.nickname}</p>
                                    </div>
                                    <div className="book_table stats">{getMark(row.user.statistics.total_orders_count, row.user.statistics.success_percent)}</div>
                                    <div className={props.type==='asks'?'filler_red':'filler_green'} 
                                    style={{ width: row.available_volume/topVolume*100<50?row.available_volume/topVolume*100+row.available_volume/topVolume*100*5:row.available_volume/topVolume*100 + '%'}}></div>
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