import GraphPanel from "../components/GraphPanel";
import Header from "../components/Header";


export default function Activity(){

    return(<>
        <Header/>
        <div style={{background:'#04020D', color: '#ccc'}} className="container">

            <GraphPanel/>

        </div>
    </>);
}