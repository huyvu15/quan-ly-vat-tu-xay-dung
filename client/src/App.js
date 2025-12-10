import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Materials from './pages/Materials';
import Suppliers from './pages/Suppliers';
import Inventory from './pages/Inventory';
import Receipts from './pages/Receipts';
import Issues from './pages/Issues';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="materials" element={<Materials />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="receipts" element={<Receipts />} />
            <Route path="issues" element={<Issues />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

