
interface UserStats{
    total_orders_count:number, 
    success_percent:string, 
    success_rate:string, 
}

interface TopUsers{
	'id': number,
    'avatar_code': string,
    'last_activity': number,
    'nickname': string,
    'is_verified': Boolean,
    'delta': number,
    'start_stats': UserStats,
    'last_stats': UserStats,
}


export type {TopUsers, UserStats}