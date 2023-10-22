import Header from "../components/Header";
import { useEffect, useState } from "react";
import UsersPanel from "../components/UsersPanel";
import '../assets/css/users.css';
import { fetchJSON } from "../utils/Utils";
import { ENDPOIN } from "../settings";
import { TopUsers } from "../types/users";
import PageLoader from "../components/pageLoader";

export default function Users(){
    const [topList, setTopList] = useState<TopUsers[]>()

    useEffect(() => {
        fetchJSON(ENDPOIN + '/api/v1/users/stats/')
        .then(result => {
            setTopList(result.data)
        })
    }, [])   
    

    return(
        <>
        {
            topList?
                <><Header />
                <div className="container">
                    <UsersPanel topList={topList}/>
                </div></>
            :<PageLoader/>
        }
        </>
    );
}