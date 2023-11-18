import { FC } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'
import {ColorType} from 'lightweight-charts';
import {Chart, CandlestickSeries, HistogramSeries} from 'lightweight-charts-react-wrapper';

import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {DeepPartial, HorzAlign, VertAlign} from 'lightweight-charts';

import '../../assets/css/GraphPanel.css';
import { ActivityHistory, ActivityTickRef } from '../../types/activity';
import { CandleHistory, OkxTicker } from '../../types/okx';

import { dayPercent} from '../../utils/Utils';

interface GraphProps{
    rates:OkxTicker | undefined
    lastPrice:number|undefined
    acticity24h: number
    chart1:any
    chart2:any
    candleHistory:CandleHistory[] | undefined
    candleSeries:any
    activityHistory: ActivityHistory[]  | undefined
    histogramSeries:any
    actList:ActivityTickRef[]
}

const Graph: FC<GraphProps> = ({rates, lastPrice, acticity24h, chart1, chart2, candleHistory, candleSeries, activityHistory, histogramSeries, actList}) => {
    
    const options1 = {
        autoSize: true,
		rightPriceScale: {
            autoScale: true,
			visible: false,
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
            text: candleHistory?'Price':'LOADING',
            fontSize: candleHistory?12:24,
            fontFamily: 'monospace',
            horzAlign: candleHistory?"top" as DeepPartial<HorzAlign>:"center" as DeepPartial<HorzAlign>,
            vertAlign: candleHistory?"left" as DeepPartial<VertAlign>:"center" as DeepPartial<VertAlign>
        }
	}
    const options2 = {
        autoSize: true,
		rightPriceScale: {
            autoScale: true,
			visible: false,
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
            text: activityHistory?'Wallet Activity':'LOADING',
            fontSize: activityHistory?12:24,
            fontFamily: 'monospace',
            horzAlign: activityHistory?"top" as DeepPartial<HorzAlign>:"center" as DeepPartial<HorzAlign>,
            vertAlign: activityHistory?"left" as DeepPartial<VertAlign>:"center" as DeepPartial<VertAlign>
        }
	}

    function getTime(timeStamp: number){
        return new Date(timeStamp * 1000).toLocaleTimeString()

    }

    function getActivityInfo(data: ActivityTickRef){
        switch (data.action_type) {
            case "availableVolume":
                return `🎚 Изменил доступный объём`
                break;

            case "totalOrdersCount":
                return `🤝 Завершил сделку`

            case "orderVolumeLimits":
                return `🎚 Изменил торговый лимит`

            case "nickname":
                return `✏️ Получил никнейм`
                
            case "new":
                return `🟢 Создал новый оффер`

            case "delete":
                return `🔴 Удалил оффер`

            case "isVerified":
                return `✅ Получил галочку`
        }    
        return ''
    }

    return (<>
            <div className="graph-panel">
                
                <div className='head'>
                    <div  className="header title">
                        <p>Wallet Activity</p>
                    </div> 
                </div>

                <div className="graph-head">
                    <div className="pair-info">
                        <p className="pair">TON/USDT</p>
                        <SkeletonTheme height={'13px'} baseColor="#3b3838" highlightColor="#615c5c">
                        <div className="p-box" >
                            {
                            rates&&lastPrice?
                                <>
                                    <p className="price">
                                        ${rates.last}
                                    </p>
                                    <p className="day-percent">
                                        {dayPercent(parseFloat(rates?.open24h), lastPrice)}
                                    </p>
                                </>
                                :
                                <Skeleton width={'90px'}/>
                            }
                        </div>
                        </SkeletonTheme>
                    </div>
                    
                    <SkeletonTheme height={'16px'} baseColor="#3b3838" highlightColor="#615c5c">
                    <div className="right-box">        
                        <div className="pair-volume-token2">
                            <p className="day-volume-token2">{
                                acticity24h>0?
                                    acticity24h
                                    :
                                <Skeleton width={'80px'}/>
                            }
                            </p>
                            <p>24h actions counter</p>
                        </div>
                    </div>
                    </SkeletonTheme>
                </div>
                        
                <div className="main-graph">
                    <div className="graph">

                    <div className='wrapper'>
                        <div className='price'>
                            <Chart ref={chart1} {...options1} >

                                {
                                    candleHistory?
                                    <CandlestickSeries
                                        data={candleHistory}
                                        reactive={true}
                                        ref={candleSeries}
                                    />:null
                                }
                                
                            </Chart>
                        </div>

                        <div className='activity'>
                            <Chart ref={chart2} {...options2} >
                                {
                                    activityHistory?
                                        <HistogramSeries
                                        data={activityHistory}
                                        reactive={true}
                                        ref={histogramSeries}
                                        color="#26a69a"
                                        priceFormat={{ type: "volume" }} 
                                        />
                                    :null
                                }
                            </Chart>
                    </div>
                </div>
            </div>
        </div>


        <div className='head live-actions-title'>Live actions</div>
            <div className='live-action-box'>
                <div className='actions-wrap'>
                    <div className='blocks'>
                        <TransitionGroup className="action-block">
                            {actList.map((row) => (
                                <CSSTransition
                                key={row.id}
                                nodeRef={row.nodeRef}
                                timeout={2000}
                                classNames="rel"
                                >
                                    <div ref={row.nodeRef} className='element'>
                                        <table>
                                        <thead></thead> 
                                        <tbody>
                                            <tr className="py-5">
                                                <td className="" >
                                                    <img alt={row.order.user.avatarCode} src={`https://walletbot.me/static/images/alias/${row.order.user.avatarCode}.svg`}/>
                                                    {row.order.user.nickname}
                                                </td>
                                                <td className="time" >{getTime(row.timestamp)}</td>
                                            </tr>
                                            <tr className="py-5">
                                                <td className="" >{getActivityInfo(row)}</td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </CSSTransition>
                            ))}
                        </TransitionGroup>

                    </div>
                </div>
            </div>
        </div>
    </>
)
}

export default Graph