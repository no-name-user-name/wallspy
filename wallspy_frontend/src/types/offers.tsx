import { LegacyRef } from "react"

// interface PaymentMethod{
//     code: string,
//     name: string,
//     origin_name_locale: string,
//     name_eng: string
// }

// interface UserData{
//     avatar_code: string,
//     nickname: string,
//     userId: number,
//     statistics: UserStats

// }

// interface UserStats{
//     success_percent: number,
//     success_rate: string,
//     total_orders_count: number,
//     user_id: number,
// }

// interface MarketOffer{
//     id: number,
//     number: string,
//     type: 'SALE' | 'PURCHASE',
//     available_volume: number,
//     base_currency_code: string,
//     quote_currency_code: string,
//     price_type: string,
//     price: number,
//     profit_percent: null,
//     min_order_amount: number,
//     max_order_amount: number,
//     max_order_volume: number,
//     payment_method: PaymentMethod,
//     user: UserData,
// }


// interface MarketOfferRef{
//     id: number,
//     number: string,
//     type: 'SALE' | 'PURCHASE',
//     available_volume: number,
//     base_currency_code: string,
//     quote_currency_code: string,
//     price_type: string,
//     price: number,
//     profit_percent: null,
//     min_order_amount: number,
//     max_order_amount: number,
//     max_order_volume: number,
//     payment_method: PaymentMethod,
//     user: UserData,
//     nodeRef: any
// }


interface MarketOfferRef {
    id: number;
    number: string;
    user: User;
    type: string;
    price: Price;
    availableVolume: number;
    orderAmountLimits: OrderAmountLimits;
    orderVolumeLimits: OrderAmountLimits;
    paymentMethods: PaymentMethod[];
    nodeRef: any
  }
  
  interface PaymentMethod {
    code: string;
    name: string;
    originNameLocale: string;
    nameEng: string;
  }
  
  interface OrderAmountLimits {
    currencyCode: string;
    min: number;
    max: number;
    approximate: boolean;
  }
  
  interface Price {
    type: string;
    baseCurrencyCode: string;
    quoteCurrencyCode: string;
    value: number;
  }
  
  interface User {
    userId: number;
    nickname: string;
    avatarCode: string;
    statistics: Statistics;
    isVerified: boolean;
  }
  
  interface Statistics {
    userId: number;
    totalOrdersCount: number;
    successRate: string;
    successPercent: number;
  }
  
interface MarketPack{
	asks: MarketOfferRef[],
	bids: MarketOfferRef[],
}

interface BookRow{
    volume: number,
    offers: MarketOfferRef[]
}

interface BookData{
    [key: number]: BookRow
}

export type {BookData, BookRow, MarketPack, PaymentMethod, MarketOfferRef}