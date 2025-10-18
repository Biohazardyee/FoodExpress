import mongoose, { Schema, Document, Types } from "mongoose";

// {id, restaurant_id, name, description, price, category}

export interface IMenu extends Document {
    _id: Types.ObjectId;
    restaurantId: Types.ObjectId;
    name: string;
    description?: string;
    price: number;
    category?: string;
}

const MenuSchema = new Schema<IMenu>(
    {
        restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurants', required: true },
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        category: { type: String }
    },
    { timestamps: true }
);

export const Menu = mongoose.model<IMenu>('Menu', MenuSchema);


