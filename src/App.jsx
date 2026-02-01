import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import UserPage from './pages/UserPage';
import { useState, useEffect } from 'react';

// const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');

// useEffect(() => {
//   if (darkMode) {
//     document.documentElement.classList.add('dark');
//     localStorage.setItem('theme', 'dark');
//   } else {
//     document.documentElement.classList.remove('dark');
//     localStorage.setItem('theme', 'light');
//   }
// }, [darkMode]);

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/user" element={<UserPage />} />

          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          <Route path="*" element={<div className="p-10 text-center">404 - Page Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;