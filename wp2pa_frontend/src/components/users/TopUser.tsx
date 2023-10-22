import verif from '../../assets/img/verif.png'
export default function TopUser(){

    return(<>
        <div className='top-body'>
            <div className='top-user'>
                <div>
                    <p>1. Name</p>
                </div>
                <div>
                    <img className='top-verif' src={verif} alt='verif' />
                </div>

                <div className='user-data'>
                
                </div>
            <div>
        </div>
            <div className='element-data'>
                <div className='element-amount'>

                </div>
                <div>

                </div>
            </div>
        </div>
    </div>
    </>)
}