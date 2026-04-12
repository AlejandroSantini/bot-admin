import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/guards/ProtectedRoute";
import PublicRoute from "../components/guards/PublicRoute";
import AuthPage from "../pages/auth/Auth";
import Layout from "../components/layout/Layout";

// New Pages
import Clients from "../pages/clients/Clients";
import ClientForm from "../pages/clients/ClientForm";
import Reservations from "../pages/reservations/Reservations";
import ReservationForm from "../pages/reservations/ReservationForm";
import Services from "../pages/services/Services";
import ServiceForm from "../pages/services/ServiceForm";
import Products from "../pages/products/Products";
import ProductForm from "../pages/products/ProductForm";
import Campaigns from "../pages/campaigns/Campaigns";
import CampaignForm from "../pages/campaigns/CampaignForm";

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/iniciar-sesion"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />

      <Route element={<Layout />}>
        {/* Default redirect */}
        <Route path="/inicio" element={<Navigate to="/reservas" replace />} />

        {/* Reservas */}
        <Route
          path="/reservas"
          element={
            <ProtectedRoute>
              <Reservations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservas/nueva"
          element={
            <ProtectedRoute>
              <ReservationForm />
            </ProtectedRoute>
          }
        />

        {/* Clientes */}
        <Route
          path="/clientes"
          element={
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes/nuevo"
          element={
            <ProtectedRoute>
              <ClientForm />
            </ProtectedRoute>
          }
        />
        {/* If we had edit for clients, add here */}

        {/* Servicios */}
        <Route
          path="/servicios"
          element={
            <ProtectedRoute>
              <Services />
            </ProtectedRoute>
          }
        />
        <Route
          path="/servicios/nuevo"
          element={
            <ProtectedRoute>
              <ServiceForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/productos"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/productos/nuevo"
          element={
            <ProtectedRoute>
              <ProductForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/productos/:id"
          element={
            <ProtectedRoute>
              <ProductForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campanas"
          element={
            <ProtectedRoute>
              <Campaigns />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campanas/nueva"
          element={
            <ProtectedRoute>
              <CampaignForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/servicios/:id"
          element={
            <ProtectedRoute>
              <ServiceForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservas/:id"
          element={
            <ProtectedRoute>
              <ReservationForm />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/" element={<Navigate to="/reservas" replace />} />
      <Route path="*" element={<Navigate to="/reservas" replace />} />
    </Routes>
  );
}
