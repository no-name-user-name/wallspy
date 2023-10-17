import { MarketOffer } from "../../types/offers";

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

function BookRows(props: {data: MarketOffer[], topVolume: number, type: 'asks' | 'bids'}){

    let colorClass = 'green'
    let data = props.data
    if (props.type === 'asks'){
        data = data.reverse()
        colorClass = 'red'
    }

    return(
        <>  
            {data.map((row:MarketOffer) => {
                
                let w = row.available_volume/props.topVolume*100
                if (w < 50){
                    w = w + w * 0.2
                }

                return (
                    <div 
                    // onClick={()=>openLink(row.id, row.user.userId)} 
                    key={row.id} 
                    className="book_row panel_decorate">

                        <div className={"book_table price " + colorClass}>{row.price.toFixed(2)}</div>
                        <div className="book_table volume">{row.available_volume.toFixed(2)}</div>
                        <div className="book_table summary">{(row.price * row.available_volume).toFixed(2)}</div>

                        <div className="book_table user">
                            <img width={15} className="Ava" alt="Ava" src={`https://walletbot.me/static/images/alias/${row.user.avatar_code}.svg`}/>
                            <p className="nick" style={{margin: 0}}>{row.user.nickname}</p>
                        </div>
                        <div className="book_table stats">{getMark(row.user.statistics.total_orders_count, row.user.statistics.success_percent)}</div>
                        <div className={props.type==='asks'?'filler_red':'filler_green'} style={{ width: w + '%'}}></div>
                    </div>
                )
            } )}             
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