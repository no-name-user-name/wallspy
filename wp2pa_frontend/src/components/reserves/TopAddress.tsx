import { Tx } from "../../types/txs";

export default function TopAddress(props:{el:Tx, counter: number},){
    const el = props.el
    const i = props.counter
    const USD = Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    })
    return(<>
        <div className='top-body'>
        <div className='top-element'>
            <div>
                <a target='blank' href={"https://tonscan.org/ru/address/" + el.addr}>{ (1+i)+'. ' + el.addr.slice(0,15) + '...' + el.addr.slice(-15)}</a>
            </div>
            <div className='element-data'>
                <div className='element-amount'>
                    Amount: {USD.format((el.value/10**9)).replaceAll(',', ' ').replace('$', '') + ' TON'}
                </div>
                <div>
                    Tx count: {el.txs_count}
                </div>
            </div>
        </div>
    </div>
    </>)
}