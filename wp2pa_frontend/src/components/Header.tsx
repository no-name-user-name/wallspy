import { useNavigate } from "react-router-dom";
import logo from "../assets/img/logo.svg"
import '../assets/css/header.css'

export default function Header(){
    const navigate = useNavigate()

    const path = window.location.pathname
    console.log(path)

    return(
        <div className="control-panel">
            <div className="elements">

                    <div className="logo">
                        <img src={logo}/>
                    </div>

                    <div className="route-buttons">
                        <div onClick={()=>{navigate('/orderbook')}} className={path=="/orderbook"?'btn btn-select':'btn'}>
                            <i className="fa-solid fa-chart-simple"></i>
                        </div> 

                        <div onClick={()=>{navigate('/reserves')}} className={path=="/reserves"?'btn btn-select':'btn'}>
                            <i className="fa-solid fa-wallet"></i>
                        </div>

                        <div onClick={()=>{navigate('/activity')}} className={path=="/activity"?'btn btn-select':'btn'}>
                            <i className="fa-solid fa-chart-line"></i>
                        </div>

                        <div onClick={()=>{navigate('/exchanges')}} className={path=="/exchanges"?'btn btn-select':'btn'}>
                            <i className="fa-solid fa-arrow-right-arrow-left"></i>
                        </div>

                        <div onClick={()=>{navigate('/dash')}} className={path=="/dash"?'btn fire btn-select':'btn fire'}>
                            <i className="fa-solid fa-fire"></i>
                        </div>

                    </div>
                </div>
            </div>
    )
}