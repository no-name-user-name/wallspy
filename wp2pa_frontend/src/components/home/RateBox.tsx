export default function RateBox(){

    return(
        <div className="pair-rate">
            <div className="pair-wrap">
                <div className="head">

                    <div className="pair-price">
                        <p className="pair">BTC/USDT</p>
                        <p className="price">$ 26,884</p>
                    </div>

                    <div className="select-dot">
                        <i className="fa-regular fa-circle-dot"></i>
                    </div>

                </div>

                <div className="body">
                    <div className="left-column">
                        <p className="title">24H high</p>
                        <p className="day-high">31,500.42</p>
                        <p className="day-percent">+3.35%</p>
                    </div>

                    <div className="right-column">
                        <p className="title">24H low</p>
                        <p className="day-low">25,500.42</p>
                        <div className="mini-graph">-</div>
                    </div>
                </div>
            </div>
        </div>
    )

}