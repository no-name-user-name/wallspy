import { AreaSeries, Chart } from "lightweight-charts-react-wrapper"
import { useLayoutEffect, useRef, useState } from "react";
import {ColorType, DeepPartial, HorzAlign, VertAlign, IChartApi} from 'lightweight-charts';

import { fetchJSON, price2Format } from "../../utils/Utils";
import { ENDPOIN } from "../../settings";
import { TxPeriodData } from "../../types/txs";



const ReservesChart = () => {
    const [periodData, setPeriodData] = useState<TxPeriodData>()
    const chart = useRef<IChartApi>(null);
    

    useLayoutEffect(() => {
        fetchJSON(ENDPOIN + '/api/v1/txs/?period=30d')
        .then(result => {
            setPeriodData(result)
        })

      return () => {
      };
    }, [])

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
    const PriceFormat = {
        TON: (price: number) => price2Format(price / 10 ** 9) + ' TON',
    };
    
    if (periodData){
        chart.current?.timeScale().fitContent()
    }

    return(
        <div className="reserves-graph">
            <div className='graph-box'>
                <Chart ref={chart} {...options} localization={{priceFormatter: PriceFormat['TON']}}>
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
    )
}

export default ReservesChart