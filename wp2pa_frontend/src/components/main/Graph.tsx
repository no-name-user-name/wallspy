import {ColorType} from 'lightweight-charts';
import {Chart, CandlestickSeries, HistogramSeries} from 'lightweight-charts-react-wrapper';
import { dayPercent} from '../../utils/Utils';

import {
    CSSTransition,
    TransitionGroup,
} from 'react-transition-group';
import {UTCTimestamp, ISeriesApi, IChartApi} from 'lightweight-charts';

import '../../assets/css/GraphPanel.css';
import { ActivityHistory, ActivityTickRef } from '../../types/activity';
import { CandleHistory, OkxTicker } from '../../types/okx';


export default function Graph(props:{rates:OkxTicker, lastPrice:number|undefined, acticity24h: number, 
    chart1:any, chart2:any, candleHistory:CandleHistory[], 
    candleSeries:any, activityHistory: ActivityHistory[]
    histogramSeries:any, actList:ActivityTickRef[]}){

    const rates = props.rates
    const lastPrice = props.lastPrice
    const acticity24h = props.acticity24h
    const chart1 = props.chart1
    const chart2 = props.chart2
    const candleHistory = props.candleHistory
    const candleSeries = props.candleSeries
    const activityHistory = props.activityHistory
    const histogramSeries = props.histogramSeries
    const actList = props.actList
    
    const options1 = {
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
        handleScale: false
	}

    function getTime(timeStamp: number){
        return new Date(timeStamp * 1000).toLocaleTimeString()

    }

    function getActivityInfo(data: ActivityTickRef){
        switch (data.action_type) {
            case 'price_change':
                if ((data.new_price!==null)&&(data.old_price!==null)){

                    if (data.new_price > data.old_price){
                        return `⬆️ Price: ${data.old_price} => ${data.new_price}`
                    }
                    else{
                        return `⬇️ Price: ${data.old_price} => ${data.new_price}`
                    }
                }
                break;

            case "offer_add":
                return `➕ Add new offer`

            case "offer_delete":
                return `➖ Delete offer`

            case "volume_change":
                if ((data.new_volume!==null)&&(data.old_volume!==null)){
                    switch (data.offer_type) {
                        case 'PURCHASE':
                            if (data.new_volume > data.old_volume){
                                return `⬆️ Volume ${data.old_volume.toFixed(2)} => ${data.new_volume.toFixed(2)}`
                            }
                            else{
                                return `💲 Buy ${(data.old_volume-data.new_volume).toFixed(2)} TON`
                            }
                    
                        case 'SALE':
                            if (data.new_volume > data.old_volume){
                                return `⬆️ Volume ${data.old_volume.toFixed(2)} => ${data.new_volume.toFixed(2)}`
                            }
                            else{
                                return `💲 Sell ${(data.old_volume-data.new_volume).toFixed(2)} TON`
                            }
                    }
                }
                break;
        }    
        return ''
    }

    return (<>
            <div className="graph-panel">
                
                <div className="head">
                    <div className="pair-info">
                        <p className="pair">TON/USDT</p>
                        <div className="p-box" >
                            <p className="price">${rates?.last}</p>
                            <p className="day-percent">{rates&&lastPrice?dayPercent(parseFloat(rates?.open24h), lastPrice):''}</p>
                        </div>
                    </div>
        
                    <div className="right-box">        
                        <div className="pair-volume-token2">
                            <p className="day-volume-token2">{acticity24h}</p>
                            <p>24h actions counter</p>
                        </div>
                    </div>
                </div>
                        
                <div className="main-graph">
                    <div className="graph">

                    <div className='wrapper'>
                        <div className="header">Token Price</div>
                            <div className='price'>
                                <Chart ref={chart1} {...options1} >
                                    <CandlestickSeries
                                        data={candleHistory}
                                        reactive={true}
                                        ref={candleSeries}
                                    />
                                </Chart>
                            </div>

                        <div className="header fixthis">Wallet Activity</div>
                            <div className='activity'>
                                <Chart ref={chart2} {...options2} >
                                    <HistogramSeries
                                        data={activityHistory}
                                        reactive={true}
                                        ref={histogramSeries}
                                        color="#26a69a"
                                        priceFormat={{ type: "volume" }} />
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
                                                        <img alt={row.user_avatar_code} src={`https://walletbot.me/static/images/alias/${row.user_avatar_code}.svg`}/>
                                                         {row.user_name}
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