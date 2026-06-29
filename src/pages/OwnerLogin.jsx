import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';
import './OwnerLogin.module.css';

const OwnerLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { ownerLogin } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = ownerLogin(username, password);
    if (result.success) {
      navigate('/owner-dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <section className="loginPage">
      <div className="loginCard">
        <div className="logoSection">
          <div className="logoIcon">
            <LogIn size={36} />
          </div>
          <h1>Owner Login</h1>
          <p>Access order management and analytics</p>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <div className="inputGroup">
            <label htmlFor="username">Username</label>
            <div className="inputWrapper">
              <input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="inputGroup">
            <label htmlFor="password">Password</label>
            <div className="inputWrapper">
              <input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          {error && (
            <div className="errorMsg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              {error}
            </div>
          )}
          <button type="submit" className="loginBtn">
            Sign In
          </button>
        </form>
        <div className="credentials">
          <p>Demo credentials</p>
          <code>Username: suguna_admin</code>
          <code>Password: suguna@2026</code>
        </div>
      </div>
    </section>
  );
};

export default OwnerLogin;
