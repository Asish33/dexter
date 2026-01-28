import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../utils/password';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
}

export class UserService {
  static async findByEmail(email: string): Promise<User | null> {
    const [result] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    return result || null;
  }

  static async findById(id: number): Promise<User | null> {
    const [result] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));

    return result || null;
  }

  static async create(userData: CreateUserInput): Promise<User> {
    const hashedPassword = await hashPassword(userData.password);

    const [newUser] = await db
      .insert(users)
      .values({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
      })
      .returning();

    if (!newUser) {
      throw new Error('Failed to create user');
    }

    return newUser;
  }

  static async updateLastLogin(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ updatedAt: new Date() })
      .where(eq(users.id, userId));
  }
}