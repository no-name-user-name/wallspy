import { useNavigate } from "react-router-dom";
import logo from "../assets/img/logo.png"
import '../assets/css/header.css'
import 'react-loading-skeleton/dist/skeleton.css'

export default function Header(){
    const navigate = useNavigate()

    const path = window.location.pathname

    return(
        <div className="control-panel">
            <div className="elements">

                    <div className="logo">
                        <img src={logo}/> 
                    </div>
                    <div className="route-buttons">
                        <div onClick={()=>{navigate('/orderbook')}} className={path=="/orderbook"||path=="/"?'btn btn-select':'btn'}>
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

                        <div onClick={()=>{navigate('/users')}} className={path=="/users"?'btn btn-select':'btn'}>

                            <i className="fa-solid fa-user"></i>
                        </div>

                    </div>
                </div>
            </div>
    )
}