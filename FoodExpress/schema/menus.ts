import mongoose, { Schema, Document, Types } from "mongoose";
import { IRestaurant } from "./restaurant.js";

// {id, restaurant_id, name, description, price, category}

export interface IMenu extends Document {
    _id: Types.ObjectId;
    // Either the raw ID or the populated restaurant document
    restaurant: Types.ObjectId | IRestaurant;
    name: string;
    description?: string;
    price: number;
    category?: string;
}

const MenuSchema = new Schema<IMenu>(
    {
        restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        category: { type: String }
    },
    { timestamps: true }
);

export const Menu = mongoose.model<IMenu>('Menu', MenuSchema);


