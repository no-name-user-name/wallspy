import {Routes, Route, BrowserRouter} from 'react-router-dom';

import './assets/css/App.css';
import Book from './views/Orderbook';
import Exchanges from './views/Exchanges';
import Orderbook from './views/Orderbook';
import Activity from './views/Activity';
import Reserves from './views/Reserves';
import Users from './views/Users';


function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/'>
          <Route index element={<Book/>} />
          <Route path='orderbook' element={<Orderbook />} />
          <Route path='reserves' element={<Reserves />} />
          <Route path='activity' element={<Activity />} />
          <Route path='exchanges' element={<Exchanges />} />
          <Route path='users' element={<Users />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
