import { useNavigate } from "react-router-dom";
import logo from "../../assets/img/logo.svg"


export default function ControlPanel(){
    const navigate = useNavigate()


    return(
        <div className="control-panel">
                <div className="logo">
                    <a onClick={()=>{navigate('/')}}>
                        <img src={logo}/>
                    </a>
                </div>

                <div className="route-buttons">
                    <div className="btn btn-select">
                        <a onClick={()=>{navigate('/')}}>
                            <i className="fa-solid fa-arrow-right-arrow-left"></i>
                        </a>
                    </div> 

                    <div className="btn btn-wallet">
                        <a onClick={()=>{navigate('/wallet')}}>
                            <i className="fa-solid fa-wallet"></i>
                        </a>
                    </div>
                </div>

                <div className="btn btn-settings">
                    <a onClick={()=>{navigate('/settings')}}>
                        <i className="fa-solid fa-gear"></i>
                    </a>
                </div>
                <div className="avatar">
                    <a onClick={()=>{navigate('/profile')}}>
                        <img src={logo}/>
                    </a>
                </div>
            </div>
    )
}