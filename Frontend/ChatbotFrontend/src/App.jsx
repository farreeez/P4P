import {
  Outlet,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import LoginPage from "./components/LoginPage/LoginPage";
import RegisterPage from "./components/RegisterPage/RegisterPage";
import BrainExercisesPage from "./components/brainExercisesComponent/BrainExercises";
import ChatPage from "./components/chatComponent/ChatPage";
import CalendarPage from "./components/dailyRemindersComponent/CalendarPage";
import HomePage from "./components/homeComponent/HomePage";
import { FontSizeProvider } from "./contexts/FontSizeContext";
import PrivateRoute from "./utils/PrivateRoute";
import PublicRoute from "./utils/PublicRoute";

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
                <Outlet />
              </PrivateRoute>
            }
          >
            <Route path="chat" element={<ChatPage />} />
            <Route path="menu" element={<HomePage />} />
            <Route path="exercises" element={<BrainExercisesPage />} />
            <Route path="reminders" element={<CalendarPage />} />
          </Route>
        </Routes>
      </Router>
    </FontSizeProvider>
  );
}

export default App;
