import "./App.css";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      {" "}
      <div className="App">
        <Navbar />{" "}
        <div style={{ paddingTop: "100px", textAlign: "center" }}>
          <h1>테스트용 본문입니다</h1>
          <p>메뉴 위에 마우스를 올려보세요!</p>{" "}
        </div>{" "}
      </div>
    </>
  );
}

export default App;
