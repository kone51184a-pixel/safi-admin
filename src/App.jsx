import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Stock from './pages/Stock';
import Users from './pages/Users';
import Accounting from './pages/Accounting';
import Settings from './pages/Settings';

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
          <Route path="/stock" element={<ProtectedRoute><Stock /></ProtectedRoute>} />
          <Route path="/utilisateurs" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/comptabilite" element={<ProtectedRoute><Accounting /></ProtectedRoute>} />
          <Route path="/parametres" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
