import {CSSTransition, TransitionGroup} from 'react-transition-group';
import { ActivityTickRef } from "../../types/activity";
import { FC } from "react";


interface ActionsProps {
    actList: ActivityTickRef[]
}

function timestamp2Time(timeStamp: number){
    return new Date(timeStamp * 1000).toLocaleTimeString()
}

function getActivityInfo(data: ActivityTickRef){
    switch (data.action_type) {
        case "availableVolume":
            return `🎚 Change avalible volume`
            break;

        case "totalOrdersCount":
            return `🤝 End deal`

        case "orderVolumeLimits":
            return `🎚 Change trade volime`

        case "nickname":
            return `✏️ Change nickname`
            
        case "new":
            return `➕ Create offer`

        case "delete":
            return `➖ Delete offer`

        case "isVerified":
            return `✅ Become Verifed`
    }    
    return ''
}

const Actions:FC<ActionsProps> = ({actList}) => {

    return(<>
        <div className='head'>
            <div  className="header title">
                <p>Live actions</p>
            </div> 
        </div>

        <div className='live-action-box'>
            <div className='actions-wrap'>
                <div className='blocks'>
                    <TransitionGroup className="action-block">
                        {actList.map((row) => (
                            <CSSTransition
                            key={row.id}
                            nodeRef={row.nodeRef}
                            timeout={333}
                            classNames="rel"
                            >
                                <div ref={row.nodeRef} className='element'>
                                    <table>
                                    <thead></thead> 
                                    <tbody>
                                        <tr className="py-5">
                                            <td className="" >
                                                <img alt={row.order.user.avatarCode} src={`https://walletbot.me/static/images/alias/${row.order.user.avatarCode}.svg`}/>
                                                {row.order.user.nickname}
                                            </td>
                                            <td className="time" >{timestamp2Time(row.timestamp)}</td>
                                        </tr>
                                        <tr className="py-5">
                                            <td className="" >{getActivityInfo(row)}</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </CSSTransition>
                        ))}
                    </TransitionGroup>

                </div>
            </div>
        </div>
    
    </>)
}

export default Actions