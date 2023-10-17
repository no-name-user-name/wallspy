import React from 'react';
import {Routes, Route, BrowserRouter} from 'react-router-dom';

import './assets/css/App.css';
import Home from './views/Home';
import Book from './views/Orderbook';
import Exchanges from './views/Exchanges';
import Orderbook from './views/Orderbook';
import Activity from './views/Activity';


function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/'>
          <Route index element={<Book/>} />
          <Route path='orderbook' element={<Orderbook />} />
          <Route path='reserves' element={<Home />} />
          <Route path='activity' element={<Activity />} />
          <Route path='exchanges' element={<Exchanges />} />
          <Route path='dash' element={<Home />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
