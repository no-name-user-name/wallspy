import { useState, useRef, createRef, useEffect } from "react";
import { ENDPOIN, WS_ENDPOINT } from "../settings";
import { ActivityHistory, ActivityTickRef, ActivityStats } from "../types/activity";
import { CandleHistory, OkxTicker } from "../types/okx";
import { timeToLocal, fetchJSON } from "../utils/Utils";
import {UTCTimestamp, ISeriesApi, IChartApi} from 'lightweight-charts';
import '../assets/css/GraphPanel.css';
import Header from "../components/Header";
import Graph from "../components/main/Graph";


export default function GraphPanel(){
    const [candleHistory, setCandleHistory] = useState<CandleHistory[]>();
	const candleSeries = useRef<ISeriesApi<'Candlestick'>>(null);
    const [activityHistory, setActivityHistory] = useState<ActivityHistory[]>();
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
		};

        socket.onerror = function(error){
            console.log(error)
        }
        return socket
    }

    function getCandleHistory(offset=5*60){
        fetchJSON('https://www.okx.com/api/v5/market/history-candles?instId=TON-USDT&bar=30m')
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
            interval = setInterval(()=>{
                const msg = {
                    "method": "ping"
                }
                this.send(JSON.stringify(msg))
            }, 15 * 1000)


			let msg = {
				"method": "activity_subscribe",
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

    return (<>
            <Header/>
            <div className="container">
                    <Graph 
                        rates={rates} 
                        lastPrice={lastPrice} 
                        acticity24h={acticity24h}
                        chart1={chart1}
                        chart2={chart2}
                        candleHistory={candleHistory}
                        candleSeries={candleSeries}
                        activityHistory={activityHistory}
                        histogramSeries={histogramSeries}
                        actList={actList}
                    />
            </div>
        </>
    )
}