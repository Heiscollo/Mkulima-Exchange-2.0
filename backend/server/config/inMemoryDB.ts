// Simple in-memory database for development when MongoDB is not available
interface IUserData {
  _id?: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role: 'buyer' | 'farmer' | 'admin';
  isVerified?: boolean;
  avatarUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class InMemoryDB {
  private users: Map<string, IUserData> = new Map();
  private idCounter = 1;

  async findUserByEmail(email: string) {
    for (const user of this.users.values()) {
      if (user.email === email) return { ...user };
    }
    return null;
  }

  async createUser(data: IUserData) {
    const id = (this.idCounter++).toString();
    const user: IUserData = {
      ...data,
      _id: id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return { ...user };
  }

  async getUserById(id: string) {
    return this.users.get(id) ? { ...this.users.get(id)! } : null;
  }
}

export const inMemoryDB = new InMemoryDB();
