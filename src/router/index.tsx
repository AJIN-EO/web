import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import AdminPage from "../pages/admin";
import AdminRequestDetailPage from "../pages/admin/detail";
import AdminRequestsPage from "../pages/admin/requests";
import VehicleSettingsPage from "../pages/admin/vehicles";
import CompanyPage from "../pages/company";
import CompanyRequestDetailPage from "../pages/company/detail";
import LoginPage from "../pages/login";
import NotFoundPage from "../pages/not-found";
import { LandingRedirect, RequireRole, RequireSession } from "./guards";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: <RequireSession><AppLayout /></RequireSession>,
    children: [
      { index: true, element: <LandingRedirect /> },
      { path: "company", element: <CompanyPage /> },
      { path: "company/requests/:publicId", element: <CompanyRequestDetailPage /> },
      { path: "admin", element: <RequireRole roles={["admin"]}><AdminPage /></RequireRole> },
      { path: "admin/requests", element: <RequireRole roles={["admin"]}><AdminRequestsPage /></RequireRole> },
      { path: "admin/vehicles", element: <RequireRole roles={["admin"]}><VehicleSettingsPage /></RequireRole> },
      { path: "admin/carryover/*", element: <RequireRole roles={["admin"]}><Navigate to="/admin/vehicles" state={{ retiredSync: true }} replace /></RequireRole> },
      { path: "admin/requests/:id", element: <RequireRole roles={["admin"]}><AdminRequestDetailPage /></RequireRole> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
