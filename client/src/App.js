import React, { Fragment } from 'react';
import Navbar from './components/layout/navbar';
import Landing from './components/layout/landing';

import './App.css';

const App = () => {
  return (
    <Fragment>
      <Navbar/>
      <Landing/>
    </Fragment>
  );
}

export default App;
