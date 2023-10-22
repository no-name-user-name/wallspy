import RatesPanel from "../components/main/RatesPanel";
import Graph from "../components/main/Graph";
import OrderBook from "../components/main/OrderBook";
import Header from "../components/Header";

export default function Home(){

    return(
        <div className="container">

            <Header/>

            <div className="graph-panel">
                
                <div className="head">
                    <div className="pair-info">
                        <p className="pair">BTC/BUSD</p>
                        <div className="p-box" >
                            <p className="price">$30,739</p>
                            <p className="day-percent">+3.35%</p>
                        </div>
                    </div>

                    <div className="right-box">
                        
                        <div className="pair-volume-token1">
                            <p className="day-volume-token1">90000 BUSD</p>
                            <p>24h volume</p>
                        </div>

                        <div className="pair-volume-token2">
                            <p className="day-volume-token2">1900 BTC</p>
                            <p>24h volume</p>
                        </div>
                                
                            <div className="star">
                                <i className="fa-regular fa-star"></i>
                                {/* <i className="fa-solid fa-star"></i> */}
                            </div>
                    </div>
                </div>

                {/* <div className="graph-settings">
                    <select className="graph-type">
                        <option>Chart</option>
                        <option>Chart1</option>
                        <option>Chart2</option>
                    </select>
                    
                    <select className="graph-interval">
                        <option>1 Day</option>
                        <option>1 Day</option>
                        <option>1 Day</option>
                    </select>
                </div> */}
                
                <div className="main-graph">
                    <div className="graph">
                        {/* <Graph/> */}
                    </div>
                    <div className="order-book">
                        {/* <OrderBook/> */}
                    </div>
                </div>


                <div className="stats">
                    <div className="top-users">
                        -
                    </div>

                    <div className="actions">
                        
                    </div>
                </div>

            </div>


        </div>
    )
}