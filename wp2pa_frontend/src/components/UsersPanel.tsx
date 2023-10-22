import { TopUsers } from "../types/users";
import TopUser from "./users/TopUser";

export default function UsersPanel(props:{topList: TopUsers[]}){

    // ACTIVE USERS 

    return (<>
        <div className="user-block">
            <div className="head">
                <div className="header title">
                    <p>Wallet Users</p>
                </div>
            </div>

            <div className="user-stats">
                <div className="left-stats">
                    <div>Unique</div>
                    <div>&#62;500</div>
                    
                </div>
                <div className="right-stats">
                    <div>Active</div>
                    <div>&#62;350</div>
                    
                </div>
            </div>
            <div className="top-ten">

                <TopUser/>

            </div>




            <div className="graph"></div>
        </div>



        
    </>)
}