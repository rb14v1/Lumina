import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'; 
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx'; 
import './index.css';

// MSAL Imports
// import { PublicClientApplication } from '@azure/msal-browser';
// import { MsalProvider } from '@azure/msal-react';
// import { msalConfig } from './api/authConfig'; // Ensure this path matches your file structure

//const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL logic
const root = ReactDOM.createRoot(document.getElementById('root'));

// msalInstance.initialize().then(() => {
//     root.render(
//         <React.StrictMode>
//             <MsalProvider instance={msalInstance}>
//                 <Router>
//                     <AuthProvider>
//                         <App />
//                     </AuthProvider>
//                 </Router>
//             </MsalProvider>
//         </React.StrictMode>
//     );
// });

root.render(
    <React.StrictMode>
        <Router>
            <AuthProvider>
                <App />
            </AuthProvider>
        </Router>
    </React.StrictMode>
);