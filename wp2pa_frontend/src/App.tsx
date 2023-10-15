import React from 'react';
import {Routes, Route, BrowserRouter} from 'react-router-dom';

import './assets/css/App.css';
import Home from './views/Home';


function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path='/'>
          <Route index element={<Home/>} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
