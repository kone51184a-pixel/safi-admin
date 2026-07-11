import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import Products from './pages/Products';
import Orders from './pages/Orders';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/vendeurs" element={<ProtectedRoute><Vendors /></ProtectedRoute>} />
          <Route path="/produits" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/commandes" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
