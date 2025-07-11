import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import HomePage from "./components/homeComponent/HomePage";
import ChatPage from "./components/chatComponent/ChatPage";
import { FontSizeProvider } from "./contexts/FontSizeContext";
import "./App.css";
import CalendarPage from "./components/dailyRemindersComponent/CalendarPage";
import PublicRoute from "./utils/PublicRoute";
import PrivateRoute from "./utils/PrivateRoute";
import LoginPage from "./components/LoginPage/LoginPage";
import RegisterPage from "./components/RegisterPage/RegisterPage";

function App() {
  return (
    <FontSizeProvider>
      <Router>
        <Routes>
          {/* Public Routes - Only accessible if not logged in */}
          <Route
            path="/*"
            element={
              <PublicRoute>
                <Routes>
                  <Route path="/" element={<LoginPage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                </Routes>
              </PublicRoute>
            }
          />

          {/* Private Routes - Only accessible if logged in */}
          <Route
            path="/app/*"
            element={
              <PrivateRoute>
                <Outlet/>
              </PrivateRoute>
            }
          >
            <Route path="home" element={<HomePage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route
              path="exercises"
              element={<div>Coming Soon: Brain Exercises</div>}
            />
            <Route path="reminders" element={<CalendarPage />} />
            <Route
              path="settings"
              element={<div>Coming Soon: Settings</div>}
            />
          </Route>
        </Routes>
      </Router>
    </FontSizeProvider>
  );
}

export default App;
