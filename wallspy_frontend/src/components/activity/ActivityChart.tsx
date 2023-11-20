import { Chart, HistogramSeries } from "lightweight-charts-react-wrapper"
import { FC, useRef } from "react"
import {DeepPartial, HorzAlign, VertAlign, ColorType, IChartApi} from 'lightweight-charts';
import { ActivityHistory } from "../../types/activity";

interface ActivityChartProps{
    activityHistory: ActivityHistory[] | undefined
    histogramSeries: any
}

const ActivityChart: FC<ActivityChartProps> = ({activityHistory, histogramSeries}) => {
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
            text: activityHistory?'Wallet Activity':'LOADING',
            fontSize: activityHistory?12:24,
            fontFamily: 'monospace',
            horzAlign: activityHistory?"top" as DeepPartial<HorzAlign>:"center" as DeepPartial<HorzAlign>,
            vertAlign: activityHistory?"left" as DeepPartial<VertAlign>:"center" as DeepPartial<VertAlign>
        }
	}


    if (chart){
        chart.current?.timeScale().fitContent()
    }

    return (<>
        <div className='activity'>
            <Chart ref={chart} {...options} >
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
    </>)
}

export default ActivityChart