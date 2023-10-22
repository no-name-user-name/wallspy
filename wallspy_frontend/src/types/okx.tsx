import {UTCTimestamp} from 'lightweight-charts';


interface OkxTicker{
    instType: "SPOT" | "SWAP" | "FUTURES" | "OPTION",
    instId: string,
    last: string,
    lastSz: string,
    askPx: string,
    askSz: string,
    bidPx: string,
    bidSz: string,
    open24h: string,
    high24h: string,
    low24h: string,
    volCcy24h: string,
    vol24h: string,
    ts: string,
    sodUtc0: string,
    sodUtc8: string,
}

interface CandleHistory{
	time: UTCTimestamp,
	open: number,
	high: number,
	low: number,
	close: number
}

export type {OkxTicker, CandleHistory}
