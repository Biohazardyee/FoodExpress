import { Service } from './service.js';
import { User, IUser } from '../schema/users.js';
import { NotFound } from '../utils/errors.js';

class UserService extends Service<IUser, string> {
    async add(data: IUser): Promise<IUser> {
        return await User.create(data);
    }

    async getAll(): Promise<IUser[]> {
        return User.find();
    }

    async getById(id: string): Promise<IUser> {
        const user = await User.findById(id);
        if (!user) {
            throw new NotFound('User not found');
        }
        return user;
    }

    async getByEmail(email: string): Promise<IUser | null> {
        return User.findOne({ email });
    }

    async getByUsername(username: string): Promise<IUser | null> {
        return User.findOne({
            username
        });
    }

    async update(id: string, patch: Partial<IUser>): Promise<IUser> {
        const updatedUser = await User.findByIdAndUpdate(id, patch, { new: true });
        if (!updatedUser) throw new NotFound('User not found');
        return updatedUser;
    }

    async delete(id: string): Promise<IUser> {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            throw new NotFound('User not found');
        }
        return deletedUser;
    }
}

export default new UserService();