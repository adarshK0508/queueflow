import React from 'react'
import ReactDOM from 'react-dom/client' // <--- This was likely missing!
import App from './App.jsx'
import './index.css'

// This imports the Theme Provider we created. 
// Since main.jsx is in the 'src' folder, we use './'
import { ThemeProvider } from './ThemeContext' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)