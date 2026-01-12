import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Menu {
  _id: string;
  name: string;
  description: string;
  price: number;
}

interface Restaurant {
  _id: string;
  name: string;
  address: string;
}

export default function RestaurantDetail() {
  const navigate = useNavigate();

  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      if (!restaurantId) return;

      try {
        // Fetch restaurant info (you might already have an endpoint, otherwise pass it via props)
        const resRestaurant = await fetch(
          `http://localhost:3000/api/restaurants`
        );
        const restaurantsData = await resRestaurant.json();
        const currentRestaurant = restaurantsData.find(
          (r: Restaurant) => r._id === restaurantId
        );
        setRestaurant(currentRestaurant);

        // Fetch menus
        const resMenus = await fetch(
          `http://localhost:3000/api/menus/by-restaurant/${restaurantId}`
        );
        if (!resMenus.ok) throw new Error("Failed to fetch menus");
        const menusData = await resMenus.json();
        setMenus(menusData);
      } catch (err: any) {
        setError(err.message || "Server error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [restaurantId]);

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: "150px" }}>Loading...</p>
    );
  if (error)
    return (
      <p style={{ textAlign: "center", marginTop: "150px", color: "red" }}>
        {error}
      </p>
    );
  if (!restaurant)
    return (
      <p style={{ textAlign: "center", marginTop: "150px" }}>
        Restaurant not found
      </p>
    );

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "100px auto 50px auto",
        padding: "0 20px",
      }}
    >
      <button
        onClick={() => navigate(-1)} // goes back to previous page
        className="auth-btn"
        style={{ marginBottom: "20px" }}
      >
        ← Back
      </button>

      <h2 style={{ color: "#ff4b2b" }}>{restaurant.name}</h2>
      <p>{restaurant.address}</p>

      <h3 style={{ marginTop: "30px" }}>Menus</h3>
      {menus.length === 0 ? (
        <p>No menus available.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "15px",
            marginTop: "15px",
          }}
        >
          {menus.map((menu) => (
            <div
              key={menu._id}
              style={{
                padding: "15px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            >
              <h4>{menu.name}</h4>
              <p>{menu.description}</p>
              <p style={{ fontWeight: "bold" }}>${menu.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
