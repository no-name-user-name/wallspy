import React, {useEffect, useRef, useState} from 'react';
import {UTCTimestamp, ISeriesApi, LineWidth, CrosshairMode, ColorType} from 'lightweight-charts';
import {Chart, CandlestickSeries, LineSeries, HistogramSeries} from 'lightweight-charts-react-wrapper';
import { fetchJSON } from '../../utils/Utils';
import { ENDPOIN, WS_ENDPOINT } from '../../settings';

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
	const lineSeries = useRef<ISeriesApi<'Line'>>(null);
	const histogramSeries = useRef<ISeriesApi<'Histogram'>>(null);


    function wsUpdateCandle(){
        const socket = new WebSocket('wss://ws.okx.com:8443/ws/v5/business');
        let interval: NodeJS.Timer | null = null;

        socket.onopen = function() {
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
                let time = parseInt(jsonData.data[0][0])/1000 as UTCTimestamp
                let open = parseFloat(jsonData.data[0][1])
                let high = parseFloat(jsonData.data[0][2])
                let low = parseFloat(jsonData.data[0][3])
                let close = parseFloat(jsonData.data[0][4])
                try {
                    candleSeries.current?.update({time: time, open: open, high: high, low: low, close: close});
                } catch (error) {

                }
            }
        };

        socket.onclose = function(event) {
            if (interval !== null){
                clearInterval(interval)
            }
			wsUpdateCandle()
		};

        socket.onerror = function(error){
            console.log(error)
        }
    
    }

    function getCandleHistory(){
        fetchJSON('https://www.okx.com/api/v5/market/history-candles?instId=TON-USDT&bar=5m')
        .then(data => {
            let ch = [] as CandleHistory[]
			for (const row of data.data) {
				ch.push({time: parseInt(row[0])/1000 as UTCTimestamp, open: parseFloat(row[1]), high: parseFloat(row[2]), low: parseFloat(row[3]), close: parseFloat(row[4])})
			}
			ch.reverse()
			setCandleHistory(ch)
            getWalletActionsHistory(ch[0].time)

        })
    }

    function getWalletActionsHistory(after: number){
        fetchJSON(ENDPOIN + '/api/v1/market/actions/?after=' + after)
        .then(data => {
            setActivityHistory(data.data)
        })  
    }

    function wsUpdateWalletAction(){
        const socket = new WebSocket(WS_ENDPOINT + '/ws/');
		
        socket.onopen = function() {
			let msg = {
				"method": "activity_subscribe"
			}
			this.send(JSON.stringify(msg))
		};

        socket.onmessage = function(event) {
			let json_data = JSON.parse(event.data)			
			if (json_data.hasOwnProperty('type')){
				if (json_data.type === 'activity_subscribe'){
                    for (let el of json_data.data){
                        // console.log(el)
                        try {
                            // lineSeries.current?.update({time: el.time, value: el.value})
                            histogramSeries.current?.update({time: el.time, value: el.value})
                        } catch (error) {
                            console.log(error)
                        }
                    }
				}
			}
		};

        socket.onclose = function(event) {
            wsUpdateWalletAction()
        }
    }

    useEffect(() => {
        getCandleHistory()
        wsUpdateCandle()
        wsUpdateWalletAction()
    }, [])

    const options = {
        // handleScroll:{
        //     mouseWheel:false,
        //     pressedMouseMove: false,
        //     horzTouchDrag:false,
        //     vertTouchDrag:false
        // },
        // handleScale:{
        //     mouseWheel: false,
        //     pinch:false
        // },
		width: 600,
		height: 300,
		rightPriceScale: {
			visible: true,
			borderColor: '#f0f2f5',
		},
		leftPriceScale: {
			visible: true,
			borderColor: 'rgba(197, 203, 206, 1)',
		},
		layout: {
			background: { type: ColorType.Solid, color: '#04020d' },
			textColor: '#f0f2f5',
		},
		grid: {
			horzLines: {
				color: 'rgba(197, 203, 206, 0.1)',
			},
			vertLines: {
				color: 'rgba(197, 203, 206, 0.1)',
			},
		},
		crosshair: {
			mode: CrosshairMode.Normal,
		},
		timeScale: {
			borderColor: 'rgba(197, 203, 206, 1)',
			timeVisible: true
		},
		// handleScroll: {
		// 	vertTouchDrag: false,
		// },
	}

    return (
        <>
            <Chart {...options}>
                <CandlestickSeries
                    data={candleHistory}
                    reactive={true}
                    ref={candleSeries}
                    // title='TON/USDT'
                    priceScaleId="right" />
            </Chart>

            <Chart {...options}>
                <HistogramSeries
                    // title='User activity'
                    data={activityHistory}
                    priceScaleId="right"
                    reactive={true}
                    ref={histogramSeries}
                    color="#26a69a"
                    priceFormat={{ type: "volume" }} />
            </Chart></>
    )

}