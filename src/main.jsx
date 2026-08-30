import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import appRuntimeConfig from './lib/runtimeConfig'

document.title = appRuntimeConfig.appTitle;
document.documentElement.dataset.appEnv = appRuntimeConfig.appEnv;

createRoot(document.getElementById('root')).render(
    <App />
)
