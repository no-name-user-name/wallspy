import { FC } from "react"
import Skeleton, { SkeletonTheme } from "react-loading-skeleton"

interface ControlPanelProps {
    currencyList: string[]
    fiatList: string[]
    currency: string
    fiat: string
    rowsCount: number
    setCurrency: any
    setFiat: any
    setRowsCount: any
}

const ControlPanel: FC<ControlPanelProps> = ({currencyList, currency, fiat, rowsCount, setCurrency, setFiat, setRowsCount, fiatList}) => {
    return(
        <>
        {
            currencyList.length>0?
                <>
                    <div>
                        <select defaultValue={currency} onChange={(e) => { setCurrency(e.target.value); } } className="numrows">
                            {currencyList.map((e: string, i) => (
                                <option key={i} value={e}>{e}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select defaultValue={fiat} onChange={(e) => { setFiat(e.target.value); } } className="numrows">
                            {fiatList.map((e: string, i) => (
                                <option key={i} value={e}>{e}</option>
                            ))}
                        </select>
                    </div><div>
                        <select defaultValue={rowsCount} onChange={(e) => { setRowsCount(parseInt(e.target.value)); } } className="numrows">
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={30}>30</option>
                        </select>
                    </div>
                </>
            :
            <div style={{flex:1, padding:"0 0px 0 25px"}}>
                <SkeletonTheme height={'30px'} baseColor="#202020" highlightColor="#444" inline={true}>
                    <Skeleton/>
                </SkeletonTheme>
            </div>
        }
        </>
    )
}

export default ControlPanel