import { createBrowserRouter } from "react-router";
import { LoginPage } from "./pages/LoginPage";
import { WardDashboard } from "./pages/WardDashboard";
import { PatientDetail } from "./pages/PatientDetail";
import { HandoverPage } from "./pages/HandoverPage";
import { MainLayout } from "./components/MainLayout";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true,                     Component: WardDashboard },
      { path: "patient/:patientId",      Component: PatientDetail },
      { path: "handover",                Component: HandoverPage  },
    ],
  },
]);
