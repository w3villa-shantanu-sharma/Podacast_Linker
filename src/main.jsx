// import React from "react";
// import ReactDOM from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
// import { MantineProvider } from "@mantine/core";
// import { Notifications } from "@mantine/notifications";
// import { AuthProvider } from "./context/AuthContext";
// import App from "./App";
// import '@mantine/core/styles.css';
// import '@mantine/notifications/styles.css';

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <MantineProvider 
//       withGlobalStyles 
//       withNormalizeCSS
//       theme={{
//         colorScheme: 'light',
//         primaryColor: 'blue',
//       }}
//     >
//       <Notifications position="top-right" />
//       <BrowserRouter>
//         <AuthProvider>
//           <App />
//         </AuthProvider>
//       </BrowserRouter>
//     </MantineProvider>
//   </React.StrictMode>
// );


import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';

// Import the global stylesheet that contains Tailwind and DaisyUI
import './index.css';

// Import the CSS for react-toastify
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        {/* Add the ToastContainer here for app-wide notifications.
          It's invisible until you trigger a toast.
        */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);