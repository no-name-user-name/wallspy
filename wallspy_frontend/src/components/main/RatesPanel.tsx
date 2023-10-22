import { OkxTicker } from "../../types/okx";
import RateBox from "./RateBox";

export default function RatesPanel(props:{rates: OkxTicker[]}){



    return(
        <><div className="rates-panel">
            <div className="head">

                <div className="header title"><p>Wallet Tokens</p></div>

                {/* <div className="sort-box">
                    <select disabled={true}>
                        <option>Sort A to Z</option>
                    </select>
                </div> */}

            </div>
            {/* <div className="search-bar row">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input disabled={true} placeholder="Search"></input>
            </div> */}

            <div className="rates row">

                {
                props.rates.map((e)=>{
                    return <RateBox key={e.instId} data={e}/>
                })
            }

            </div>
        </div></>
    )
}