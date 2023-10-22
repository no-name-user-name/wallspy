import verif from '../../assets/img/verif.png'
import { TopUsers } from '../../types/users'
export default function TopUserRow(props:{user:TopUsers, counter: number}){
    const u = props.user
    const i = props.counter

    return(<>
        <div key={u.user_id+u.last_activity} className='top-body'>
            <div className='top-user'>
                <div className='user-name'>
                    <p>{i+1}.</p>
                    <img className="ava" src={`https://walletbot.me/static/images/alias/${u.avatar_code}.svg`} alt='ava' />

                    <p>{u.nickname}</p>
                    <img className={u.is_verified?'top-verif':'hidden'} src={verif} alt='verif' />
                </div>
                <div className='user-data'>
                    <div className='percent'>{u.last_stats.success_percent}%</div>
                    <div className='period'>+{u.delta}</div>
                    <div className='alltime'>{u.last_stats.total_orders_count}</div>
                </div>
            </div>
        </div>
    </>)
}