import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Viz from './components/Viz';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/viz",
    element: <Viz />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);