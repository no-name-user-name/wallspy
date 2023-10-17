import Header from "../components/Header";
import "../assets/css/RatesPanel.css"
import RatesPanel from "../components/main/RatesPanel";


export default function Exchanges(){

    return(<>
        <Header/>
        <div className="container">
            <RatesPanel/>
        </div>
    </>);
}