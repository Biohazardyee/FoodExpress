import "./App.css";
import { Routes, Route, Link } from "react-router-dom";
import Signup from "./pages/Signup.tsx";
import Login from "./pages/Login.tsx";
import Home from "./pages/Home.tsx";
import RestaurantDetail from "./pages/RestaurantDetail.tsx";
import { useAuthContext } from "./context/AuthContext.tsx";

function App() {
  const { user } = useAuthContext();

  return (
    <>
      <header className="header">
        <h1 className="logo">
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            FoodExpress
          </Link>
        </h1>

        <nav>
          {user ? (
            // Logged-in view
            <>
              <span style={{ fontWeight: "bold", color: "#ff4b2b" }}>
                {user.username}
              </span>
              <button
                className="signup-btn"
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.reload();
                }}
                style={{ marginLeft: "10px" }}
              >
                Logout
              </button>
            </>
          ) : (
            // Logged-out view
            <>
              <Link to="/login">
                <button className="signup-btn">Login</button>
              </Link>

              <Link to="/signup">
                <button className="signup-btn">Sign Up</button>
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* ===== Page Content ===== */}
      <main>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route
            path="/restaurant/:restaurantId"
            element={<RestaurantDetail />}
          />
        </Routes>
      </main>
    </>
  );
}

export default App;
