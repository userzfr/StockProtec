import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { OperationalMaterialPage } from "./components/OperationalMaterialPage";
import { PharmacyStockPage } from "./components/PharmacyStockPage";
import { BagDetailPage } from "./components/BagDetailPage";
import { LegalPage } from "./components/LegalPage";
import { NotFound } from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: OperationalMaterialPage },
      { path: "pharmacy", Component: PharmacyStockPage },
      { path: "legal", Component: LegalPage },
      { path: "bag/:qrCode", Component: BagDetailPage },
      { path: "*", Component: NotFound },
    ],
  },
]);
