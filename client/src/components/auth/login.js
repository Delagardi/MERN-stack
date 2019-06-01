import React, { Fragment, useState } from 'react'
import { Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { email, password } = formData;

  const onChange = (event) => setFormData({ ...formData, [event.target.name]: event.target.value});

  const onSubmit = (event) => {
    event.preventDefault();
    
    console.log(formData);    
  }

  return (
    <Fragment>
      <h1 className="large text-primary">Sign In</h1>
      <p className="lead"><i className="fas fa-user"></i> Login to Your Account</p>
      <form 
        className="form" 
        action="login-profile.html"
        onSubmit={ (event) => onSubmit(event)}>
        <div className="form-group">
          <input 
            type="email" 
            placeholder="Email Address" 
            name="email"
            value={email}
            onChange={ (event) => onChange(event) }
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={ (event) => onChange(event) }
            required
          />
        </div>
        <input type="submit" className="btn btn-primary" value="Register" />
      </form>
      <p className="my-1">
        Don't have an account? <Link to="/registration">Sign Up</Link>
      </p>
    </Fragment>
  )
}

export default Login;