import {UTCTimestamp} from 'lightweight-charts';
import { Offer } from './offers';


interface ActivityStats{
    count24h: number,
    balance: {
        income: number,
        outcome: number,
    },
    txs: {
        income_count: number,
        outcome_count: number
    }
}

interface ActivityHistory{
	time: UTCTimestamp,
	value: number,
}


interface ActivityTick{
    id:number,
    order_id:number,
    action_type:"offer_delete"|"offer_add"|'volume_change'|'price_change',
    user_id:number,
    user_name:string,
    user_avatar_code:string,
    old_price:number|null,
    new_price:number|null,
    offer_type:'PURCHASE'|'SALE',
    old_volume:number|null,
    new_volume:number|null,
    timestamp:number
}
interface ActivityTickRef{
    id:number,
    order: Offer,
    action_type:'availableVolume'|'nickname'|'isVerified'|'totalOrdersCount'|'orderVolumeLimits'|'new'|'delete',
    timestamp:number
    nodeRef: any
}

export type {ActivityStats, ActivityTick, ActivityTickRef, ActivityHistory}
