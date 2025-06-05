import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/homeComponent/HomePage";
import ChatPage from "./components/chatComponent/ChatPage";
import { FontSizeProvider } from "./context/FontSizeContext";
import "./App.css";

function App() {
  return (
    <FontSizeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/exercises" element={<div>Coming Soon: Brain Exercises</div>} />
          <Route path="/reminders" element={<div>Coming Soon: Daily Reminders</div>} />
          <Route path="/settings" element={<div>Coming Soon: Settings</div>} />
        </Routes>
      </Router>
    </FontSizeProvider>
  );
}

export default App;
