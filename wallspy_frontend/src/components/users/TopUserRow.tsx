import { FC } from 'react'
import verif from '../../assets/img/verif.png'
import { TopUsers } from '../../types/users'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

interface TopUserRowProps{
    user:TopUsers
    counter: number
}

const TopUserRow: FC<TopUserRowProps> = ({user, counter}) => {
    return(<>
        <div className='top-user-element'>
            <div className='top-user'>
                <div className='user-name'>
                    <p>{counter+1}.</p>
                    <img className="ava" src={`https://walletbot.me/static/images/alias/${user.avatar_code}.svg`} alt='ava' />

                    <p>{user.nickname}</p>
                    <img className={user.is_verified?'top-verif':'hidden'} src={verif} alt='verif' />
                </div>
                <div className='user-data'>
                    <div className='percent'>{user.last_stats.success_percent}%</div>
                    <div className='period'>+{user.delta}</div>
                    <div className='alltime'>{user.last_stats.total_orders_count}</div>
                </div>
            </div>
        </div>
    </>)
}

const TopUserRowSkeleton: FC = () => {
    return(<>
        <SkeletonTheme height={'13px'} baseColor="#3b3838" highlightColor="#615c5c" inline={true}>

        <div className='top-user-element'>
            <div className='top-user'>
                <div className='user-name'>
                    <Skeleton width={'150px'}/>
                </div>
                <div className='user-data'>
                <Skeleton width={'50px'}/>
                <Skeleton width={'50px'}/>
                <Skeleton width={'50px'}/>
                </div>
            </div>
        </div>
        </SkeletonTheme>
    </>)
}

export {TopUserRow, TopUserRowSkeleton}