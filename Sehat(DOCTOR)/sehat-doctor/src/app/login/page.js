// pages/login.js
import Head from 'next/head';
import styles from './login.module.css';

export default function Login() {
  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center p-0" style={{background: 'var(--background)'}}>
        <div className={`row w-100 justify-content-center m-0`}>
          <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4 px-2 px-sm-0">
            <div className={styles['login-card']}>
              <h2 className="text-center mb-4" style={{color: 'var(--accent)'}}>Sign in to your account</h2>
              <form>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email address</label>
                  <input type="email" className="form-control" id="email" placeholder="you@example.com" />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input type="password" className="form-control" id="password" placeholder="********" />
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">Login</button>
                </div>
                <p className="mt-3 text-center text-muted">
                  Don't have an account? <a href="#" style={{color: 'var(--accent)'}}>Sign up</a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
