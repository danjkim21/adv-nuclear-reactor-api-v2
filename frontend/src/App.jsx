import './App.css';
import Header from './components/Header';
import Landing from './components/Landing';
import About from './components/About';
import Login from './components/Login';

import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  let [data, setData] = useState([]);

  // Fetch all reactor data from api
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`/api`);
      const json = await response.json();
      setData(json);
    };
    fetchData().catch(console.error);
  }, []);

  return (
    <Router>
      <div className="App">
        <Header />

        <Routes>
          <Route
            path="/"
            element={
              <>
                <Landing data={data} />
              </>
            }
          />
          <Route
            path="/about"
            element={
              <>
                <About data={data} />
              </>
            }
          />
          <Route
            path="/dev"
            element={
              <>
                <Login />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
