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

export type {OkxTicker}
