import React, { isValidElement, useEffect } from "react";
import "./App.css";
import ContextMenuTrigger from "./components/ContextMenuTrigger";

function App() {
  return (
    <div className="App">
      <ContextMenuTrigger>
        <div>11111111111</div>
      </ContextMenuTrigger>
      <ContextMenuTrigger>
        <div>22222222222</div>
      </ContextMenuTrigger>
    </div>
  );
}

export default App;
