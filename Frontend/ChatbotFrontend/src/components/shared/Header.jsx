import { useContext } from "react";
import { FontSizeContext } from "../../contexts/FontSizeContext";
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";

export default function Header({ title }) {
  const { fontSize, increaseFontSize, decreaseFontSize } =
    useContext(FontSizeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="app-header">
      <div className="header-left">
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
        <h1>{title}</h1>
      </div>
      <div className="font-buttons-container">
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
