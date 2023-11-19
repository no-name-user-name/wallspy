import { FC } from "react";
import { OkxTicker } from "../../types/okx";
import {RateBox, RateBoxSkeleton} from "./RateBox";

interface RatesPanelProps {
    rates: OkxTicker[] | undefined
}

const RatesPanel:FC<RatesPanelProps> = ({rates}) => {
    const fake_array = [...Array(2)]

    return(
        <>
        <div className="rates-panel">
            <div className="head">
                <div className="header title"><p>Wallet Tokens</p></div>
            </div>

            <div className="rates row">
                {
                    rates?
                        rates.map((e)=>(
                            <RateBox key={e.instId} data={e}/>
                        ))
                    :
                        fake_array.map((e, i)=>(
                            <RateBoxSkeleton key={i}/>
                        ))
                }
            </div>
        </div>
        </>
    )
}

export default RatesPanel