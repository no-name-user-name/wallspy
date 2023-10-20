import { ActivityStats } from "../../types/activity"

export default function ReservesPanel(props:{balance:number, tokenPrice: number, balanceDelta:ActivityStats}) {
    const USD = Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    })
    const balance = props.balance
    const tokenPrice = props.tokenPrice
    const balanceDelta = props.balanceDelta
    const balanceTON = USD.format((balance/10**9)).replaceAll(',', ' ').replace('$', '') + ' TON'
    const balanceUSD = USD.format((tokenPrice * balance / 10 ** 9)).replaceAll(',',' ')
    const positivBalanceDelta = '+' + USD.format(balanceDelta.balance.income / 10 ** 9).replaceAll(',', ' ').replace('$', '') + ' TON'
    const negativeBalanceDelta = '-' + USD.format(balanceDelta.balance.outcome / 10 ** 9).replaceAll(',', ' ').replace('$', '') + ' TON'
    const txCount = balanceDelta.txs.income_count+balanceDelta.txs.outcome_count
    const inTxPercent = (balanceDelta.txs.income_count / (txCount) * 100).toFixed(2)
    const outTxPercent = (balanceDelta.txs.outcome_count / (balanceDelta.txs.income_count+balanceDelta.txs.outcome_count) * 100).toFixed(2)

    return (
        <>
        <div className="res-block">
            <div className="header title">
                <p>Wallet Reserves</p>
            </div>
            <div className="res-data">
               <div className="balances">
                    <div className="content left">
                        <div className="title">Balance</div>
                        <p>
                            {balanceTON}
                        </p>
                        <p>
                            {balanceUSD}
                        </p>
                    </div>
                    <div className="content right">
                        <div className="title">Day delta</div>
                        <p>
                            {positivBalanceDelta}
                        </p>
                        <p>
                            {negativeBalanceDelta}
                        </p>
                    </div>
               </div>
               <div className="txs">
                    <div>
                        <div className="title">Day transactions</div>
                        <div className="content left">
                            <p>
                                {txCount}
                            </p>
                        </div>
                    </div>
                    <div>
                        <div className="content same">
                            <p>
                            {'In: ' + inTxPercent + '%'}
                            </p>
                            <p>
                            {'Out: ' + outTxPercent + '%'}
                            </p>
                        </div>
                    </div>
               </div>
            </div>  
        </div>
        </>
    )
}