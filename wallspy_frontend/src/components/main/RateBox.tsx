import { OkxTicker } from "../../types/okx";
import { dayPercent } from "../../utils/Utils";

export default function RateBox(props:{data: OkxTicker}){
    const data = props.data

    return(
        <div className="pair-rate">
            <div className="pair-wrap">
                <div className="head">
                    <div className="pair-price">
                        <p className="pair">{data.instId.replace('-','/')}</p>
                        <p className="price">${data.last}</p>
                    </div>
                    <div className="select-dot">
                        <p className="day-percent">{dayPercent(parseFloat(data.open24h), parseFloat(data.last))}</p>
                    </div>
                </div>
                <div className="body">
                    <div className="left-column">
                        <p className="title">24H high</p>
                        <p className="day-high">{data.high24h}</p>
                    </div>
                    <div className="right-column">
                        <p className="title">24H low</p>
                        <p className="day-low">{data.low24h}</p>
                    </div>
                </div>
                <div className="mini-graph">
                    <img alt="mini-graph" src="https://www.coingecko.com/coins/17980/sparkline.svg"/>
                </div>
            </div>
        </div>
    )
}