import { FC } from "react";
import { Tx } from "../../types/txs";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'

const USD = Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
})
const toFormat = (num: number) => {
    return USD.format(num).replaceAll(',', ' ').replace('$', '')
}

interface TopAddressProps {
    el: Tx,
}

const TopAddress: FC<TopAddressProps> = ({el}) => {

    return(
    <>
        <div className='top-body'>
            <div className='top-element'>
                <div>
                <a target='blank' href={"https://tonscan.org/ru/address/" + el.addr}>{ el.addr.slice(0,18) + '...' + el.addr.slice(-18)}</a> 
                </div>

                <div className='element-data'>
                    <div className='element-amount'>
                        Amount: {toFormat(el.value/10**9) + ' TON'}
                    </div>
                </div>
            </div>
            
        </div>
    </>
    )
}
const TopAddressSkeleton: FC = () => {
    const array = [...Array(5)]
    return(
    <>
        <SkeletonTheme height={'15px'} baseColor="#3b3838" highlightColor="#615c5c">

        {
            array.map((e, i) => (
                <div key={i} className='top-body'>
                    <div className='top-element'>
                        <div>
                            <Skeleton width={'300px'}/>
                        </div>

                        <div className='element-data'>
                            <div className='element-amount'>
                                <Skeleton width={'150px'}/>
                            </div>
                        </div>
                    </div>
                </div>
            ))
        } 
        </SkeletonTheme>
    </>
    )
}


export {TopAddress, TopAddressSkeleton}