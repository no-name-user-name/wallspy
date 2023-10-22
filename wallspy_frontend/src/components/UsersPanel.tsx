import { TopUsers } from "../types/users";
import TopUserRow from "./users/TopUserRow";
import TopUser from "./users/TopUserRow";

export default function UsersPanel(props:{topList: TopUsers[]}){

    return (<>
        <div className="user-block">
            <div className="head">
                <div className="header title">
                    <p>Wallet Users</p>
                </div>
            </div>

            {/* <div className="user-stats hidden">
                <div className="left-stats">
                    <div>Unique</div>
                    <div>&#62;500</div>
                    
                </div>
                <div className="right-stats">
                    <div>Active</div>
                    <div>&#62;350</div>
                    
                </div>
            </div> */}
            <div className="top-ten">

                <div className='top-body'>
                    <div className='top-user headtable'>
                        <div className='user-name row-name'>
                            Top of the week
                        </div>
                        <div className='user-data '>
                            <div className='percent row-name'>Success rate</div>
                            <div className='period row-name'>Week orders</div>
                            <div className='alltime row-name'>All orders</div>
                        </div>
                    </div>
                </div>

                {
                    props.topList.map((u: TopUsers, i: number)=>
                        <>
                            <TopUserRow key={'user'+u.user_id} counter={i} user={u}/>
                        </>
                    )
                }
            </div>
            <div className="graph"></div>
        </div>



        
    </>)
}