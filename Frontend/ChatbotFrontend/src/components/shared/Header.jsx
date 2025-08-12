import { useContext } from "react";
import { FontSizeContext } from "../../contexts/FontSizeContext";
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";
import { AppContext } from "../../contexts/AppContextProvider";

export default function Header({ title }) {
  const { logout } = useContext(AppContext);
  const { fontSize, increaseFontSize, decreaseFontSize } =
    useContext(FontSizeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isChatPage = location.pathname === "/app/chat";
  const isMenuPage = location.pathname === "/app/menu";

  const handleBack = () => {
    navigate(-1);
  };

  const handleMenu = () => {
    navigate("/app/menu");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="app-header">
      <div className="header-left">
        <h1>{title}</h1>
        {!isMenuPage && !isChatPage && (
          <button
            className="header-button back-button"
            onClick={handleBack}
            aria-label="Go back to previous page"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
        )}
        {isChatPage && (
          <button
            className="header-button back-button"
            onClick={handleMenu}
            aria-label="Open main menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            <span>Menu</span>
          </button>
        )}
      </div>

      <div className="font-buttons-container">
        <button
          className="header-button logout-button"
          onClick={handleLogout}
          aria-label="Logout from account"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Logout</span>
        </button>

        <button
          className="font-button"
          onClick={increaseFontSize}
          aria-label="Increase font size"
          title="Increase text size"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="20"
            height="20"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>

        <button
          className="font-button"
          onClick={decreaseFontSize}
          aria-label="Decrease font size"
          title="Decrease text size"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="20"
            height="20"
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  );
}