import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from 'react-router-dom';

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul className="navbar-nav">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/checkout">
                <span aria-label="emoji" role="img">
                  🛒
                </span>{' '}
                Checkout
              </Link>
            </li>
            <li>
              <Link to="/payments">
                <span aria-label="emoji" role="img">
                  💸
                </span>{' '}
                Payments
              </Link>
            </li>
            <li>
              <Link to="/customers">
                <span aria-label="emoji" role="img">
                  🧑🏿‍🤝‍🧑🏻
                </span>{' '}
                Customers
              </Link>
            </li>
            <li>
              <Link to="/subscriptions">
                <span aria-label="emoji" role="img">
                  🔄
                </span>{' '}
                Subscriptions
              </Link>
            </li>
          </ul>
        </nav>

        <main>
          <Switch>
            <Route path="/checkout">
              <div>Checkout</div>
            </Route>
            <Route path="/payments">
              <div>Payments</div>
            </Route>
            <Route path="/customers">
              <div>Customers</div>
            </Route>
            <Route path="/subscriptions">
              <div>Subscriptions</div>
            </Route>
            <Route path="/success">
              <div>CheckoutSuccess</div>
            </Route>
            <Route path="/failed">
              <div>CheckoutFail</div>
            </Route>
            <Route path="/">
              <div>Home</div>
            </Route>
          </Switch>
        </main>
      </div>
    </Router>
  );
}

export default App;
