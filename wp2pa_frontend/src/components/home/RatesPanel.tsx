import RateBox from "./RateBox";

export default function RatesPanel(){
    return(
        <div className="rates-panel">
            <div className="head row">
                <div className="logo-name">
                    <p>Wallet Activity</p>
                </div>  
                <div className="sort-box">
                    <select>
                        <option>Sort A to Z</option>
                    </select>
                </div>  
                
            </div>
            <div className="search-bar row">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input placeholder="Search"></input>
            </div>

            <div className="rates row">
                <RateBox/>
                <RateBox/>
                <RateBox/>
                <RateBox/> 
            </div>
        </div>
    )
}