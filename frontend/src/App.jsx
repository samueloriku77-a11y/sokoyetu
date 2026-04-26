import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import LoginCustomer from './pages/LoginCustomer'
import LoginVendor from './pages/LoginVendor'
import LoginDriver from './pages/LoginDriver'
import ProductPage from './pages/ProductPage'
import RegisterCustomer from './pages/RegisterCustomer'
import RegisterVendor from './pages/RegisterVendor'
import RegisterDriver from './pages/RegisterDriver'
import Register from './pages/Register'
import CustomerDashboard from './pages/customer/Dashboard'
import VendorDashboard from './pages/vendor/Dashboard'
import DriverDashboard from './pages/driver/Dashboard'
import LandingPage from './pages/LandingPage'
import AdminDashboard from './pages/admin/Dashboard'
import Careers from './pages/Careers'
import AdminPosts from './pages/admin/Posts'
import BlogFeed from './components/BlogFeed'

function RoleRoute({ role, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/"        element={<LandingPage />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/login/customer" element={<LoginCustomer/>} />
        <Route path="/login/vendor" element={<LoginVendor/>} />
        <Route path="/login/driver" element={<LoginDriver/>} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/customer" element={<RegisterCustomer/>} />
        <Route path="/register/vendor" element={<RegisterVendor/>} />
        <Route path="/register/driver" element={<RegisterDriver/>} />
        <Route path="/product/:id" element={<ProductPage/>} />
        <Route path="/blog" element={<BlogFeed/>} />
        <Route path="/careers"  element={<Careers />} />
        <Route path="/admin/posts" element={<RoleRoute role="ADMIN"><AdminPosts/></RoleRoute>} />

        <Route path="/customer/*" element={
          <RoleRoute role="CUSTOMER"><CustomerDashboard /></RoleRoute>
        }/>
        <Route path="/vendor/*" element={
          <RoleRoute role="VENDOR"><VendorDashboard /></RoleRoute>
        }/>
        <Route path="/driver/*" element={
          <RoleRoute role="DRIVER"><DriverDashboard /></RoleRoute>
        }/>
        <Route path="/admin/*" element={
          <RoleRoute role="ADMIN"><AdminDashboard /></RoleRoute>
        }/>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
