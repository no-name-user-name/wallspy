
import {FC} from 'react';
import { ActivityStats } from '../../types/activity';

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'
import { price2Format } from '../../utils/Utils';

interface BalanceProps {
    balance: number
    tokenPrice: number
    balanceDelta:ActivityStats | undefined
}

const Balance: FC<BalanceProps> = ({balance, tokenPrice, balanceDelta}) =>{

    return(
        <div className="res-data">
               <div className="balances">
                    <div className="content left">
                        <div className="title">Balance</div>

                        {
                            balance === 0 || tokenPrice === 0?
                                <SkeletonTheme height={'15px'} baseColor="#3b3838" highlightColor="#615c5c">
                                    <p>
                                        <Skeleton width={'100px'}/>
                                    </p>
                                    <p>
                                        <Skeleton width={'100px'}/>
                                    </p>
                                </SkeletonTheme>
                            :
                                    <>
                                    <p>
                                        {price2Format(balance/10**9) + ' TON'}
                                    </p>
                                    <p>
                                        {'$' + price2Format(tokenPrice * balance / 10 ** 9)}
                                    </p>
                                    </>
                        }

                    </div>

                    <div className="content right">
                        <div className="title">Day delta</div>
                        
                            {
                                !balanceDelta?
                                    <SkeletonTheme height={'15px'} baseColor="#3b3838" highlightColor="#615c5c">
                                        <p>
                                            <Skeleton width={'100px'}/>
                                        </p>
                                        <p>
                                            <Skeleton width={'100px'}/>
                                        </p>
                                    </SkeletonTheme>
                                :
                                    <>
                                        <p>
                                            {'+'+price2Format(balanceDelta.balance.income / 10 ** 9) + ' TON'}
                                        </p>
                                        <p>
                                            {'-' + price2Format(balanceDelta.balance.outcome / 10 ** 9) + ' TON'}
                                        </p>
                                    </>

                            }
                    </div>
               </div>
               <div className="txs">
                    <div>
                        <div className="title">Day transactions</div>
                        <div className="content left">
                            {
                                !balanceDelta?
                                    <SkeletonTheme height={'15px'} baseColor="#3b3838" highlightColor="#615c5c">
                                        <p>
                                            <Skeleton width={'100px'}/>
                                        </p>
                                    </SkeletonTheme>
                                :
                                    <p>
                                        {balanceDelta.txs.income_count+balanceDelta.txs.outcome_count}
                                    </p>

                            }
                        </div>
                    </div>
                    <div>
                        <div className="content same">
                            {
                                !balanceDelta?
                                    <SkeletonTheme height={'15px'} baseColor="#3b3838" highlightColor="#615c5c">
                                    <p>
                                        <Skeleton width={'100px'}/>
                                    </p>
                                    <p>
                                        <Skeleton width={'100px'}/>
                                    </p>
                                    </SkeletonTheme>
                                :
                                <>
                                    <p>
                                        {'Income: ' + (balanceDelta.txs.income_count / (balanceDelta.txs.income_count+balanceDelta.txs.outcome_count + 1) * 100).toFixed(2) + '%'}
                                    </p>
                                    <p>
                                        {'Outcome: ' + (balanceDelta.txs.outcome_count / (balanceDelta.txs.income_count+balanceDelta.txs.outcome_count + 1) * 100).toFixed(2) + '%'}
                                    </p>
                                </>
                            }
                        </div>
                    </div>
               </div>
            </div> 
    )
}

export default Balance