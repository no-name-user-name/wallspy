import {ColorType} from 'lightweight-charts';
import {Chart, CandlestickSeries, HistogramSeries, AreaSeries} from 'lightweight-charts-react-wrapper';

import { ActivityStats } from "../../types/activity"
import { TopTx, Tx, TxPeriodData } from "../../types/txs"
import { fetchJSON } from '../../utils/Utils';
import { ENDPOIN } from '../../settings';
import { useEffect, useRef, useState } from 'react';
import TopAddress from '../reserves/TopAddress';
import {IChartApi} from 'lightweight-charts';


export default function ReservesPanel(props:{balance:number, tokenPrice: number, balanceDelta:ActivityStats, periodData: TxPeriodData}) {
    const USD = Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    })
    const periodData = props.periodData
    const balance = props.balance
    const tokenPrice = props.tokenPrice
    const balanceDelta = props.balanceDelta
    const balanceTON = USD.format((balance/10**9)).replaceAll(',', ' ').replace('$', '') + ' TON'
    const balanceUSD = USD.format((tokenPrice * balance / 10 ** 9)).replaceAll(',',' ')
    const positivBalanceDelta = '+' + USD.format(balanceDelta.balance.income / 10 ** 9).replaceAll(',', ' ').replace('$', '') + ' TON'
    const negativeBalanceDelta = '-' + USD.format(balanceDelta.balance.outcome / 10 ** 9).replaceAll(',', ' ').replace('$', '') + ' TON'
    const txCount = balanceDelta.txs.income_count+balanceDelta.txs.outcome_count

    let inTxPercent = '0'
    let outTxPercent = '0'
    const [top, setTop] = useState<TopTx>()
    const chart1 = useRef<IChartApi>(null);

    function fitCharts(){
        chart1.current?.timeScale().fitContent()
    }


    useEffect(() => {
        fetchJSON(ENDPOIN + '/api/v1/txs/top')
        .then(result => {
            setTop(result.data)
            fitCharts()
        })
    
      return () => {
        
      }
    }, [])
    


    if (txCount!==0){
        inTxPercent = (balanceDelta.txs.income_count / (txCount) * 100).toFixed(2)
        outTxPercent = (balanceDelta.txs.outcome_count / (balanceDelta.txs.income_count+balanceDelta.txs.outcome_count) * 100).toFixed(2)
    }
    
    const PriceFormat = {
        TON: (price: number) => USD.format(price / 10 ** 9).replaceAll(',', ' ').replace('$', '') + ' TON',
    };

    const options = {
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
        handleScale: false
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
                        <p>
                            {balanceTON}
                        </p>
                        <p>
                            {balanceUSD}
                        </p>
                    </div>
                    <div className="content right">
                        <div className="title">Day delta</div>
                        <p>
                            {positivBalanceDelta}
                        </p>
                        <p>
                            {negativeBalanceDelta}
                        </p>
                    </div>
               </div>
               <div className="txs">
                    <div>
                        <div className="title">Day transactions</div>
                        <div className="content left">
                            <p>
                                {txCount}
                            </p>
                        </div>
                    </div>
                    <div>
                        <div className="content same">
                            <p>
                            {'In: ' + inTxPercent + '%'}
                            </p>
                            <p>
                            {'Out: ' + outTxPercent + '%'}
                            </p>
                        </div>
                    </div>
               </div>
            </div>  

            
        </div>

        <div className="reserves-graph">
            <div className="header">Balance 30D</div>

            <div className='graph-box'>
                <Chart ref={chart1} {...options} localization={{priceFormatter: PriceFormat['TON']}}>

                    <AreaSeries
                        data={periodData.data.balance}
                        lineWidth={2}
                        crosshairMarkerVisible={false}
                    />
                    
                </Chart>

            </div>
        </div>
        <div className={top?'top-addresses':'top-addresses hidden'}>
            <div className='head'>
                <div  className="header title">
                    <p>Top deposits per day:</p>
                </div>
            </div> 
            {
                top?.income.map((el: Tx, i:number)=>
                    <TopAddress key={'income-'+el.addr} el={el} counter={i}/>
                )
            }
        </div>
        <div className={top?'top-addresses':'top-addresses hidden'}>
            <div className='head'>
                <div  className="header title">
                    <p>Top withdrawals per day:</p>
                </div>
            </div> 
            {
                top?.outcome.map((el: Tx, i:number)=>
                    <TopAddress key={'outcome-'+el.addr} el={el} counter={i}/>
                )
            }
        </div>

        </>
    )
}