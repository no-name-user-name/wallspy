import React, {useEffect, useRef, useState, useLayoutEffect, ForwardedRef, RefAttributes, createRef} from 'react';

import {UTCTimestamp, ISeriesApi, LineWidth, CrosshairMode, ColorType, IChartApi} from 'lightweight-charts';
import {Chart, CandlestickSeries, LineSeries, HistogramSeries, ChartProps} from 'lightweight-charts-react-wrapper';
import { dayPercent, fetchJSON, timeToLocal} from '../../utils/Utils';
import { ENDPOIN, WS_ENDPOINT } from '../../settings';

import {
    CSSTransition,
    TransitionGroup,
} from 'react-transition-group';

import '../../assets/css/GraphPanel.css';
import { OkxTicker } from '../../types/okx';
import { ActivityStats, ActivityTick, ActivityTickRef } from '../../types/activity';
import { MarketOffer, MarketOfferRef } from '../../types/offers';


interface CandleHistory{
	time: UTCTimestamp,
	open: number,
	high: number,
	low: number,
	close: number
}

interface ActivityHistory{
	time: UTCTimestamp,
	value: number,
}

export default function Graph(){
	const [candleHistory, setCandleHistory] = useState<CandleHistory[]>([]);
	const candleSeries = useRef<ISeriesApi<'Candlestick'>>(null);
    const [activityHistory, setActivityHistory] = useState<ActivityHistory[]>([]);
    const [lastPrice, setLastPrice] = useState<number>()
    const [acticity24h, setActicity24h] = useState<number>(0)
    const [rates, setRates] = useState<OkxTicker>()
    const [actList, setActList] = useState<ActivityTickRef[]>([])

	const histogramSeries = useRef<ISeriesApi<'Histogram'>>(null);

    const chart1 = useRef<IChartApi>(null);
    const chart2 = useRef<IChartApi>(null);

    function fitCharts(){
        chart1.current?.timeScale().fitContent()
        chart2.current?.timeScale().fitContent();
    }

    function wsUpdateCandle(){
        const socket = new WebSocket('wss://ws.okx.com:8443/ws/v5/business');
        let interval: NodeJS.Timer | null = null;

        socket.onopen = function() {
            console.log('[+] okx ws open')

            interval = setInterval(()=>{
                this.send('ping')
            }, 20 * 1000)
            let msg = {
                "op": "subscribe",
                "args": [
                    {
                    "channel": "candle5m",
                    "instId": "TON-USDT"
                    }
                ]
            }
            this.send(JSON.stringify(msg))
        };
            
        socket.onmessage = function(event) {
            if (event.data === 'pong'){
                return
            }
            let jsonData = JSON.parse(event.data)
            if (jsonData.hasOwnProperty('data')){
                let time = parseInt(jsonData.data[0][0])/1000 + 5 * 60 as UTCTimestamp
                let open = parseFloat(jsonData.data[0][1])
                let high = parseFloat(jsonData.data[0][2])
                let low = parseFloat(jsonData.data[0][3])
                let close = parseFloat(jsonData.data[0][4])
                try {
                    candleSeries.current?.update({
                        time: timeToLocal(time) as UTCTimestamp, 
                        open: open, 
                        high: high, 
                        low: low, 
                        close: close
                    })
                    setLastPrice(open)
                    fitCharts()
                } catch (error) {

                }
            }
        };

        socket.onclose = function(event) {
            if (interval !== null){
                clearInterval(interval)
            }
            console.log('[-] okx ws closed')

		};

        socket.onerror = function(error){
            console.log(error)
        }
        return socket
    }

    function getCandleHistory(offset=5*60){
        fetchJSON('https://www.okx.com/api/v5/market/history-candles?instId=TON-USDT&bar=5m')
        .then(data => {
            let ch = [] as CandleHistory[]
			for (const row of data.data) {
				ch.push({
                    time: timeToLocal(parseInt(row[0])/1000) + offset as UTCTimestamp, 
                    open: parseFloat(row[1]), 
                    high: parseFloat(row[2]), 
                    low: parseFloat(row[3]), 
                    close: parseFloat(row[4])
                })
			}
			ch.reverse()
			setCandleHistory(ch)
            getWalletActionsHistory(ch[0].time-offset - 60 * 60 * 3)
            fitCharts()

        })
    }

    function getWalletActionsHistory(after: number){
        fetchJSON(ENDPOIN + '/api/v1/market/actions/?after=' + after)
        .then(data => {
            let localFormat = [] as ActivityHistory[]
            for (const e of data.data){
                localFormat.push({time: timeToLocal(e.time) as UTCTimestamp, value: e.value})
            }
            setActivityHistory(localFormat)
            fitCharts()
        })  
    }

    function wsUpdateWalletAction(){
        const socket = new WebSocket(WS_ENDPOINT + '/ws/');
        let interval: NodeJS.Timer | null = null;
		
        socket.onopen = function() {
            console.log('[+] main ws open')
            interval = setInterval(()=>{
                const msg = {
                    "method": "ping"
                }
                this.send(JSON.stringify(msg))
            }, 15 * 1000)


			let msg = {
				"method": "activity_subscribe"
			}
			this.send(JSON.stringify(msg))
		};

        socket.onmessage = function(event) {
			let json_data = JSON.parse(event.data)			
			if (json_data.hasOwnProperty('type')){
				if (json_data.type === 'activity_subscribe'){
                    let i = 0
                    for (let el of json_data.data){
                        
                        try {
                            histogramSeries.current?.update({time: timeToLocal(el.time) as UTCTimestamp, value: el.value})
                            i ++
                        } catch (error) {
                            console.log(error)
                        }
                    }
                    fitCharts()
                    getActivityStats()
                    
                    const actions = json_data.actions as ActivityTickRef[]
                    let bank = [] as ActivityTickRef[]
                    for (let each of actions){
                        each['nodeRef'] = createRef()
                        bank.push(each)
                    }
                    setActList(current => [...current, ... bank])
				}
			}
		};

        socket.onclose = function(event) {
            if (interval !== null){
                clearInterval(interval)
            }
            console.log('[-] main ws closed')
        }
        return socket
    }
    
    function getPairTicker(){
        fetchJSON('https://www.okx.com/api/v5/market/ticker?instId=TON-USDT-SWAP')
        .then(result => {
            const tick = result.data[0] as OkxTicker
            setRates(tick)
            setLastPrice(parseFloat(tick.last))
        })
    }

    function getActivityStats(){
        fetchJSON(ENDPOIN + '/api/v1/market/actions/stats/')
        .then(result => {
            const data = result.data as ActivityStats
            setActicity24h(data.count24h)
        })
        
    }

    function getLastActions(){
        fetchJSON(ENDPOIN + '/api/v1/market/actions/last/')
        .then(result => {
            let bank = [] as ActivityTickRef[]
            for (let each of result.actions){
                each['nodeRef'] = createRef()
                bank.push(each)
            }
            setActList(bank)
        })
    }

    useEffect(() => {     
        if (actList.length >= 20){
            setActList(curr => 
                curr.filter(el => {
                    return el.id !== curr[curr.indexOf(actList[0])].id
                })
            ) 
        }
    }, [actList])
    
    useEffect(() => {
        getLastActions()
        getActivityStats()
        getPairTicker()
        getCandleHistory()
        const okx_ws = wsUpdateCandle()
        const main_ws = wsUpdateWalletAction()

        return ()=>{
            okx_ws.close()
            main_ws.close()
        }
    }, []) 

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
		}
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
                                <Chart ref={chart2} {...options1} >
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
                                    classNames="item"
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