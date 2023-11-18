import {ColorType, DeepPartial, HorzAlign, VertAlign} from 'lightweight-charts';
import {Chart, AreaSeries} from 'lightweight-charts-react-wrapper';

import { ActivityStats } from "../../types/activity"
import { TopTx, Tx, TxPeriodData } from "../../types/txs"
import { fetchJSON } from '../../utils/Utils';
import { ENDPOIN } from '../../settings';
import { FC, useEffect, useRef, useState } from 'react';
import {TopAddress, TopAddressSkeleton} from '../reserves/TopAddress';
import {IChartApi} from 'lightweight-charts';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'

interface ReservesPanelProps {
    balance:number
    tokenPrice: number
    balanceDelta:ActivityStats | undefined
    periodData: TxPeriodData | undefined
}

const USD = Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
})

const toFormat = (num: number) => {
    return USD.format(num).replaceAll(',', ' ').replace('$', '')
}

const ReservesPanel: FC<ReservesPanelProps> = ({balance, tokenPrice, balanceDelta, periodData}) => {
    const [top, setTop] = useState<TopTx>()
    const chart1 = useRef<IChartApi>(null);

    useEffect(() => {
        fetchJSON(ENDPOIN + '/api/v1/txs/top')
        .then(result => {
            setTop(result.data)
        })

      return () => {
      }
    }, [])
    

    const PriceFormat = {
        TON: (price: number) => toFormat(price / 10 ** 9) + ' TON',
    };
    function fitCharts(){
        chart1.current?.timeScale().fitContent()
    }
    if (periodData){
        fitCharts()
    }

    let options = {
        autoSize: true,
		rightPriceScale: {
            autoScale: true,
			visible: true,
			borderColor: '#f0f2f5',
            alignLabels: false,
            borderVisible: false,
            entireTextOnly: true,
            ticksVisible: true
		},
		layout: {
			background: { type: ColorType.Solid, color: '#04020d' },
			textColor: '#f0f2f5',
            fontSize: 10
		},
		grid: {
			horzLines: {
				color: 'rgba(197, 203, 206, 0.1)',
			},
			vertLines: {
				color: 'rgba(197, 203, 206, 0.1)',
			},
		},
		timeScale: {
			borderColor: 'rgba(197, 203, 206, 1)',
			timeVisible: true,
            rightOffset: 1
		},
        handleScroll: false,
        handleScale: false,
        watermark: {
            visible: true,
            color: 'rgba(100, 100, 100, 50)',
            text: periodData?'Balance 30D':'LOADING',
            fontSize: periodData?12:24,
            fontFamily: 'monospace',
            horzAlign: periodData?"top" as DeepPartial<HorzAlign>:"center" as DeepPartial<HorzAlign>,
            vertAlign: periodData?"left" as DeepPartial<VertAlign>:"center" as DeepPartial<VertAlign>
        }
	}

    return (
        <>
                
        <div className="res-block">
            <div className='head'>
                <div  className="header title">
                    <p>Wallet Reserves</p>
                </div> 
            </div>
            
            <div className="res-data">
               <div className="balances">
                    <div className="content left">
                        <div className="title">Balance</div>

                        {
                            balance === 0 || tokenPrice=== 0?
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
                                        {toFormat(balance/10**9) + ' TON'}
                                    </p>
                                    <p>
                                        {'$' + toFormat(tokenPrice * balance / 10 ** 9)}
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
                                            {'+'+toFormat(balanceDelta.balance.income / 10 ** 9) + ' TON'}
                                        </p>
                                        <p>
                                            {'-' + toFormat(balanceDelta.balance.outcome / 10 ** 9) + ' TON'}
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
        </div>

        <div className="reserves-graph">
            {/* <div className="header">Balance 30D</div> */}

            <div className='graph-box'>
                <Chart ref={chart1} {...options} localization={{priceFormatter: PriceFormat['TON']}}>
                    {
                        periodData?
                            <AreaSeries
                            data={periodData.data.balance}
                            lineWidth={2}
                            crosshairMarkerVisible={false}
                        />
                        
                        :
                        null
                    }
                </Chart>
            </div>
        </div>
        
        <div className='top-addresses'>
            <div className='head'>
                <div  className="header title">
                    <p>Top deposits per day:</p>
                </div>
            </div> 
            {
                top?
                    top.income.map((el: Tx, i:number)=>
                        <TopAddress key={'income-' + el.addr} el={el}/>
                    )
                :
                <TopAddressSkeleton/>
            }
        </div>
        <div className='top-addresses'>
            <div className='head'>
                <div  className="header title">
                    <p>Top withdrawals per day:</p>
                </div>
            </div> 
            {
                top?
                top.outcome.map((el: Tx, i:number)=>
                    <TopAddress key={'outcome-' + el.addr} el={el}/>
                )
                :
                <TopAddressSkeleton/>
            }
        </div>
        </>
    )
}

export default ReservesPanel