import { LegacyRef } from "react"

interface PaymentMethod{
    code: string,
    name: string,
    origin_name_locale: string,
    name_eng: string
}

interface UserData{
    avatar_code: string,
    nickname: string,
    userId: number,
    statistics: UserStats

}

interface UserStats{
    success_percent: number,
    success_rate: string,
    total_orders_count: number,
    user_id: number,
}

interface MarketOffer{
    id: number,
    number: string,
    type: 'SALE' | 'PURCHASE',
    available_volume: number,
    base_currency_code: string,
    quote_currency_code: string,
    price_type: string,
    price: number,
    profit_percent: null,
    min_order_amount: number,
    max_order_amount: number,
    max_order_volume: number,
    payment_method: PaymentMethod,
    user: UserData,
}


interface MarketOfferRef{
    id: number,
    number: string,
    type: 'SALE' | 'PURCHASE',
    available_volume: number,
    base_currency_code: string,
    quote_currency_code: string,
    price_type: string,
    price: number,
    profit_percent: null,
    min_order_amount: number,
    max_order_amount: number,
    max_order_volume: number,
    payment_method: PaymentMethod,
    user: UserData,
    nodeRef: any
}

interface MarketPack{
	asks: MarketOfferRef[],
	bids: MarketOfferRef[],
}

interface BookRow{
    volume: number,
    offers: MarketOffer[]
}

interface BookData{
    [key: number]: BookRow
}

export type {BookData, BookRow, MarketPack, MarketOffer, UserStats, UserData, PaymentMethod, MarketOfferRef}