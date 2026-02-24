import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import Loader from './components/common/Loader'
import Layout from './components/common/Layout'
import ErrorBoundary from './components/common/ErrorBoundary'

// Lazy load components for better performance
const Login = lazy(() => import('./components/auth/Login'))
const Setup = lazy(() => import('./components/auth/Setup'))
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'))
const ProductList = lazy(() => import('./components/products/ProductList'))
const ProductForm = lazy(() => import('./components/products/ProductForm'))
const ProductDetails = lazy(() => import('./components/products/ProductDetails'))
const CategoryList = lazy(() => import('./components/categories/CategoryList'))
const POS = lazy(() => import('./components/sales/POS'))
const SaleList = lazy(() => import('./components/sales/SaleList'))
const SaleDetails = lazy(() => import('./components/sales/SaleDetails'))
const Invoice = lazy(() => import('./components/sales/Invoice'))
const PurchaseList = lazy(() => import('./components/purchases/PurchaseList'))
const PurchaseForm = lazy(() => import('./components/purchases/PurchaseForm'))
const PurchaseDetails = lazy(() => import('./components/purchases/PurchaseDetails'))
const SupplierList = lazy(() => import('./components/suppliers/SupplierList'))
const SupplierForm = lazy(() => import('./components/suppliers/SupplierForm'))
const InventoryStatus = lazy(() => import('./components/inventory/InventoryStatus'))
const StockAlerts = lazy(() => import('./components/inventory/StockAlerts'))
const InventoryMovements = lazy(() => import('./components/inventory/InventoryMovements'))
const CustomerList = lazy(() => import('./components/customers/CustomerList'))
const CustomerForm = lazy(() => import('./components/customers/CustomerForm'))
const CampaignList = lazy(() => import('./components/campaigns/CampaignList'))
const CampaignForm = lazy(() => import('./components/campaigns/CampaignForm'))
const ReportGenerator = lazy(() => import('./components/reports/ReportGenerator'))
const PrinterConfig = lazy(() => import('./components/hardware/PrinterConfig'))
const WeighingScale = lazy(() => import('./components/hardware/WeighingScale'))
const UserManagement = lazy(() => import('./components/settings/UserManagement'))
const StoreSettings = lazy(() => import('./components/settings/StoreSettings'))

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/setup" element={<Setup />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Products */}
            <Route path="products">
              <Route index element={<ProductList />} />
              <Route path="new" element={<ProductForm />} />
              <Route path=":id" element={<ProductDetails />} />
              <Route path=":id/edit" element={<ProductForm />} />
            </Route>
            
            {/* Categories */}
            <Route path="categories">
              <Route index element={<CategoryList />} />
            </Route>
            
            {/* Sales */}
            <Route path="sales">
              <Route index element={<SaleList />} />
              <Route path="pos" element={<POS />} />
              <Route path=":id" element={<SaleDetails />} />
              <Route path="invoice/:id" element={<Invoice />} />
            </Route>
            
            {/* Purchases */}
            <Route path="purchases">
              <Route index element={<PurchaseList />} />
              <Route path="new" element={<PurchaseForm />} />
              <Route path=":id" element={<PurchaseDetails />} />
            </Route>
            
            {/* Suppliers */}
            <Route path="suppliers">
              <Route index element={<SupplierList />} />
              <Route path="new" element={<SupplierForm />} />
              <Route path=":id" element={<SupplierForm />} />
              <Route path=":id/edit" element={<SupplierForm />} />
            </Route>
            
            {/* Inventory */}
            <Route path="inventory">
              <Route index element={<InventoryStatus />} />
              <Route path="alerts" element={<StockAlerts />} />
              <Route path="movements" element={<InventoryMovements />} />
            </Route>
            
            {/* Customers */}
            <Route path="customers">
              <Route index element={<CustomerList />} />
              <Route path="new" element={<CustomerForm />} />
              <Route path=":id" element={<CustomerForm />} />
              <Route path=":id/edit" element={<CustomerForm />} />
            </Route>
            
            {/* Campaigns - FIXED ROUTES */}
            <Route path="campaigns">
              <Route index element={<CampaignList />} />
              <Route path="new" element={<CampaignForm />} />
              <Route path=":id" element={<CampaignForm />} />
              <Route path=":id/edit" element={<CampaignForm />} />
            </Route>
            
            {/* Reports */}
            <Route path="reports">
              <Route index element={<ReportGenerator />} />
            </Route>
            
            {/* Hardware */}
            <Route path="hardware">
              <Route path="printers" element={<PrinterConfig />} />
              <Route path="scale" element={<WeighingScale />} />
            </Route>
            
            {/* Settings */}
            <Route path="settings">
              <Route path="users" element={<UserManagement />} />
              <Route path="store" element={<StoreSettings />} />
            </Route>
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

export default App