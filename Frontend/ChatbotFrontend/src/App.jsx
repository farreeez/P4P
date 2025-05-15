import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import ChatPage from "./components/chatComponent/ChatPage";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <ChatPage />
    </div>
  );
}

export default App;
