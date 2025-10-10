import mongoose, {Schema, Document} from "mongoose";

// {id, name, address, phone, opening_hours}

export interface IRestaurant extends Document {
    _id: Schema.Types.ObjectId;
    name: string;
    address: string;
    phone: string;
    opening_hours: string;
}

const RestaurantSchema = new Schema<IRestaurant>({
    name: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    opening_hours: { type: String, required: true }
}, {
    timestamps: true
});

export const Restaurant = mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);