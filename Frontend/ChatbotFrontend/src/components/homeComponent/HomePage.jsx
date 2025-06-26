import { useNavigate } from "react-router-dom";
import Header from "../shared/Header";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();

  const menuItems = [
    {
      id: "chat",
      title: "Chat Assistant",
      description: "Talk with your friendly AI helper",
      path: "/app/chat",
      className: "chat",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="menu-icon"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 10h8M8 14h4" />
        </svg>
      ),
    },
    {
      id: "exercises",
      title: "Brain Exercises",
      description: "Keep your mind sharp and active",
      path: "/app/exercises",
      className: "exercises",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="menu-icon"
        >
          <path d="M9 12l2 2 4-4" />
          <path d="M21 12c-1.25-1.73-3.5-3-6-3s-4.75 1.27-6 3c1.25 1.73 3.5 3 6 3s4.75-1.27 6-3z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      id: "reminders",
      title: "Daily Reminders",
      description: "Never forget important tasks",
      path: "/app/reminders",
      className: "reminders",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="menu-icon"
        >
          <path d="M6 4h10l4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          <path d="M14 2v4h4" />
          <path d="M10 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      id: "settings",
      title: "Settings",
      description: "Customize your experience",
      path: "/app/settings",
      className: "settings",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="menu-icon"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  const handleMenuClick = (path) => {
    navigate(path);
  };

  return (
    <div className="home-container">
      <Header title="Senior Helper" />
      
      <section className="welcome-section">
        <h2 className="welcome-title">Welcome Back!</h2>
        <p className="welcome-subtitle">
          Choose from the options below to get started. Everything is designed to be simple and easy to use.
        </p>
      </section>

      <main className="menu-container">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`menu-button ${item.className}`}
            onClick={() => handleMenuClick(item.path)}
            aria-label={`Go to ${item.title} - ${item.description}`}
          >
            {item.icon}
            <div>
              <div className="menu-label">{item.title}</div>
              <div className="menu-description">{item.description}</div>
            </div>
          </button>
        ))}
      </main>
    </div>
  );
}