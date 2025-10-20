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
        // Better proportioned chat bubble icon
        <svg
          className="menu-icon"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          width="48"
          height="48"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
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
        // Puzzle piece icon representing brain exercises
        <svg
          className="menu-icon"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          width="48"
          height="48"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z"
          />
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
        // Bell with notification dot for reminders
        <svg
          className="menu-icon"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          width="48"
          height="48"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5"
          />
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
          Choose from the options below to get started. Everything is designed
          to be simple and easy to use.
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
            <div>{item.icon}</div>
            <div className="menu-content">
              <div className="menu-label">{item.title}</div>
              <div className="menu-description">{item.description}</div>
            </div>
          </button>
        ))}
      </main>
    </div>
  );
}
