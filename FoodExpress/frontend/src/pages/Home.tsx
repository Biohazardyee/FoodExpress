import { useEffect, useState } from "react";
import RestaurantCard from "../components/RestaurantCard";

function Home() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const res = await fetch("http://localhost:3000/api/restaurants");
        if (!res.ok) throw new Error("Failed to fetch restaurants");
        const data = await res.json();
        setRestaurants(data);
      } catch (err: any) {
        setError(err.message || "Server error");
      } finally {
        setLoading(false);
      }
    }

    fetchRestaurants();
  }, []);

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: "150px" }}>
        Loading restaurants...
      </p>
    );
  if (error)
    return (
      <p style={{ textAlign: "center", marginTop: "150px", color: "red" }}>
        {error}
      </p>
    );

  return (
    <div className="restaurants-container">
      {restaurants.map((r) => (
        <RestaurantCard
          key={r._id}
          _id={r._id}
          name={r.name}
          address={r.address}
        />
      ))}
    </div>
  );
}

export default Home;
