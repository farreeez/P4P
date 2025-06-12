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
  const isHomePage = location.pathname === "/app/home";

  return (
    <div className="app-header">
      <div className="header-left">
        <h1>{title}</h1>
      </div>
      <div className="font-buttons-container">
        {!isHomePage && (
          <button className="back-button" onClick={() => navigate(-1)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}
        <button
          className="back-button"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
        <button className="font-button" onClick={increaseFontSize}>
          +
        </button>
        <button className="font-button" onClick={decreaseFontSize}>
          -
        </button>
      </div>
    </div>
  );
}
