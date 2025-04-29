import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
// import { Box } from "./pages/Box/box.tsx";

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    {/* <Box /> */}
    <App />
  </StrictMode>
);
