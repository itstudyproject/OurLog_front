import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // 이 파일은 기본 제공 스타일 (지금 수정 안 해도 됨)

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
    <App />
);
