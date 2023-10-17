import Header from "../components/Header";
import OrderBook from "../components/main/OrderBook";

export default function Orderbook(){
    return(<>
        <Header/>
        <div style={{background:'#04020D', color: '#ccc'}} className="container">
            <OrderBook/>
        </div>
    </>);
}