import { FC } from "react";
import { OkxTicker } from "../../types/okx";
import { dayPercent } from "../../utils/Utils";

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'

interface RateBoxProps {
    data: OkxTicker
}

const RateBox:FC<RateBoxProps> = ({data}) => {
    let pairId: { [Name: string]: number} = {
        'TON-USDT': 17980,
        'BTC-USDT': 1
    }

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
                    <img alt="mini-graph" src={"https://www.coingecko.com/coins/"+ pairId[data.instId] + "/sparkline.svg"}/>
                </div>
            </div>
        </div>
    )
}

const RateBoxSkeleton:FC = () => {
    
    return(
        <SkeletonTheme height={'13px'} baseColor="#3b3838" highlightColor="#fde3e3">
        <div className="pair-rate">
            <div className="pair-wrap">
                <div className="head">
                    <div className="pair-price">
                        <Skeleton width={'50px'}/>
                        <Skeleton width={'50px'}/>
                    </div>
                    <div className="select-dot">
                        <Skeleton width={'50px'}/>
                    </div>
                </div>
                <div className="body">
                    <div className="left-column">
                        <p className="title">24H high</p>
                        <Skeleton width={'50px'}/>
                    </div>
                    <div className="right-column">
                        <p className="title">24H low</p>
                        <Skeleton width={'50px'}/>
                    </div>
                </div>
                <div className="mini-graph">
                    <Skeleton height={'50px'}/>
                </div>
            </div>
        </div>
        </SkeletonTheme>
    )
}



export {RateBox, RateBoxSkeleton}