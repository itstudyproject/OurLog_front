// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App
import React from "react";
import Navbar from "./components/Navbar";
import "./styles/Navbar.css"; // 스타일 파일도 잊지말고 불러오기!

const App: React.FC = () => {
  return (
    <div className="App">
      <Navbar />
      <div style={{ paddingTop: "100px", textAlign: "center" }}>
        <h1>테스트용 본문입니다</h1>
        <p>메뉴 위에 마우스를 올려보세요!</p>
      </div>
    </div>
  );
};

export default App;
