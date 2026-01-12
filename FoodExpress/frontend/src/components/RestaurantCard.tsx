import { Link } from "react-router-dom";

interface RestaurantCardProps {
  _id: string;
  name: string;
  address: string;
}

export default function RestaurantCard({ _id, name, address }: RestaurantCardProps) {
  return (
    <div className="restaurant-card">
      <h3>{name}</h3>
      <p>{address}</p>
      <Link to={`/restaurant/${_id}`}>
        <button className="auth-btn" style={{ marginTop: "10px" }}>
          View Menus
        </button>
      </Link>
    </div>
  );
}
