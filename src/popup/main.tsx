import { createRoot } from "react-dom/client";
import { PopupApp } from "./PopupApp";
import "./popup.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Required popup root element is missing.");
}

createRoot(rootElement).render(<PopupApp />);
