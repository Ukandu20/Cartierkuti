import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { Provider } from './components/Theme/provider'  
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './axiosConfig'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider>
        <App />
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
)
