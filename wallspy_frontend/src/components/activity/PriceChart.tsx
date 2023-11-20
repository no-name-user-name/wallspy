import { CandlestickSeries, Chart } from "lightweight-charts-react-wrapper"
import { FC, useRef } from "react"
import { CandleHistory } from "../../types/okx"
import {DeepPartial, HorzAlign, VertAlign, ColorType, IChartApi} from 'lightweight-charts';

interface PriceChartProps {
    candleSeries: any
    candleHistory: CandleHistory[] | undefined
}

const PriceChart: FC<PriceChartProps> = ({candleHistory, candleSeries}) => {
    const chart = useRef<IChartApi>(null);

    const options = {
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

    if (chart){
        chart.current?.timeScale().fitContent()
    }

    return (<>
        <div className='price'>
            <Chart ref={chart} {...options} >
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
    </>)
}

export default PriceChart