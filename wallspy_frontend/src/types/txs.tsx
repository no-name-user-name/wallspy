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



interface Tx{
    addr: String
    value: number
    txs_count: number
}

interface TopTx{
	income: Tx[],
	outcome: Tx[],
}


export type {TxPeriodData, GraphData, TopTx, Tx}