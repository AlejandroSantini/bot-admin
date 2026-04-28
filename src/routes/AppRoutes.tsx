import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/guards/ProtectedRoute";
import PublicRoute from "../components/guards/PublicRoute";
import AuthPage from "../pages/auth/Auth";
import Layout from "../components/layout/Layout";

// New Pages
import Home from "../pages/Home";
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
import Settings from "../pages/settings/Settings";
import Dashboard from "../pages/dashboard/Dashboard";
import Billing from "../pages/billing/Billing";

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
        <Route path="/inicio" element={<Home />} />

        <Route
          path="/estadisticas"
          element={
            <ProtectedRoute moduleKey="reservas">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* Reservas */}
        <Route
          path="/reservas"
          element={
            <ProtectedRoute moduleKey="reservas">
              <Reservations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservas/nueva"
          element={
            <ProtectedRoute moduleKey="reservas">
              <ReservationForm />
            </ProtectedRoute>
          }
        />

        {/* Clientes */}
        <Route
          path="/clientes"
          element={
            <ProtectedRoute moduleKey="clientes">
              <Clients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes/nuevo"
          element={
            <ProtectedRoute moduleKey="clientes">
              <ClientForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes/:id"
          element={
            <ProtectedRoute moduleKey="clientes">
              <ClientForm />
            </ProtectedRoute>
          }
        />
        {/* If we had edit for clients, add here */}

        {/* Servicios */}
        <Route
          path="/servicios"
          element={
            <ProtectedRoute moduleKey="servicios">
              <Services />
            </ProtectedRoute>
          }
        />
        <Route
          path="/servicios/nuevo"
          element={
            <ProtectedRoute moduleKey="servicios">
              <ServiceForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/productos"
          element={
            <ProtectedRoute moduleKey="productos">
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/productos/nuevo"
          element={
            <ProtectedRoute moduleKey="productos">
              <ProductForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/productos/:id"
          element={
            <ProtectedRoute moduleKey="productos">
              <ProductForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campanas"
          element={
            <ProtectedRoute moduleKey="campanas">
              <Campaigns />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campanas/nueva"
          element={
            <ProtectedRoute moduleKey="campanas">
              <CampaignForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/campanas/:id"
          element={
            <ProtectedRoute moduleKey="campanas">
              <CampaignForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/servicios/:id"
          element={
            <ProtectedRoute moduleKey="servicios">
              <ServiceForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservas/:id"
          element={
            <ProtectedRoute moduleKey="reservas">
              <ReservationForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/facturacion"
          element={
            <ProtectedRoute>
              <Billing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/configuracion"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/" element={<Home />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
