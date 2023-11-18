import { FC } from "react";
import { TopUsers } from "../types/users";
import {TopUserRow, TopUserRowSkeleton} from "./users/TopUserRow";

interface UsersPanelProps{
    topList: TopUsers[] | undefined
}

const UsersPanel: FC<UsersPanelProps> = ({topList}) => {
    const fake_array = [...Array(15)]

    return (<>
        <div className="user-block">
            <div className="head">
                <div className="header title">
                    <p>Wallet Users</p>
                </div>
            </div>

            <div className="top-ten">

                <div className='top-user-header'>
                    <div className='top-user'>
                        <div className='user-name row-name'>
                            7 days top MarketMaker
                        </div>
                        <div className='user-data '>
                            <div className='percent row-name'>Success rate</div>
                            <div className='period row-name'>Week orders</div>
                            <div className='alltime row-name'>All orders</div>
                        </div>
                    </div>
                </div>

                {
                    topList?

                        topList.map((u: TopUsers, i: number)=>
                            <TopUserRow key={u.id} counter={i} user={u}/>
                        )
                        :
                        fake_array.map((u, i)=>
                            <TopUserRowSkeleton key={i}/>
                        )
                }
            </div>
            <div className="graph"></div>
        </div>
    </>)
}

export default UsersPanel