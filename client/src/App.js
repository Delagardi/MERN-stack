import React, { Fragment } from 'react';
import Navbar from './components/layout/navbar';
import Landing from './components/layout/landing';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './components/auth/login';
import Registration from './components/auth/registration';

import './app.css';

const App = () => {
  return (
    <Router>
      <Fragment>
        <Navbar/>
        <Route exact path="/" component={Landing}/>
        <div className="container">
        <Switch>
          <Route exact path="/login" component={Login}/>
          <Route exact path="/registration" component={Registration}/>
        </Switch>
        </div>
      </Fragment>
    </Router>
  );
}

export default App;
