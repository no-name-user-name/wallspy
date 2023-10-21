import {UTCTimestamp} from 'lightweight-charts';

interface TxPeriodData{
    'data': {
        'income': GraphData[],
        'outcome': GraphData[],
        'balance': GraphData[],
    }
}

interface GraphData{
	time: UTCTimestamp,
	value: number,
}

export type {TxPeriodData, GraphData}