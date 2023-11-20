import Skeleton, { SkeletonTheme } from "react-loading-skeleton"
import { dayPercent } from "../../utils/Utils"
import { FC } from "react"
import { OkxTicker } from "../../types/okx"

interface HeadBlockProps{
    rates: OkxTicker | undefined
    lastPrice: number | undefined
    acticity24h: number
}

const HeadBlock: FC<HeadBlockProps> = ({rates, lastPrice, acticity24h}) => {
    return(<>

            <div className="graph-head">
                <div className="pair-info">
                    <p className="pair">TON/USDT</p>
                    <SkeletonTheme height={'13px'} baseColor="#3b3838" highlightColor="#615c5c">
                    <div className="p-box" >
                        {
                        rates&&lastPrice?
                            <>
                                <p className="price">
                                    ${rates.last}
                                </p>
                                <p className="day-percent">
                                    {dayPercent(parseFloat(rates?.open24h), lastPrice)}
                                </p>
                            </>
                            :
                            <Skeleton width={'90px'}/>
                        }
                    </div>
                    </SkeletonTheme>
                </div>
                
                <SkeletonTheme height={'16px'} baseColor="#3b3838" highlightColor="#615c5c">
                <div className="right-box">        
                    <div className="pair-volume-token2">
                        <p className="day-volume-token2">{
                            acticity24h>0?
                                acticity24h
                                :
                            <Skeleton width={'80px'}/>
                        }
                        </p>
                        <p>24h actions counter</p>
                    </div>
                </div>
                </SkeletonTheme>
            </div>

    </>)
}

export default HeadBlock