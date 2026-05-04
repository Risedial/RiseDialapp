import { supabaseServer } from '../supabase/server';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  preferred_name: string | null;
  subscription_status: 'active' | 'lapsed' | 'cancelled';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_premium_item_id: string | null;
  plan_type: 'monthly' | 'annual' | null;
  has_premium_memory: boolean;
  next_billing_date: string | null;
  subscription_lapsed_at: string | null;
  created_at: string;
}

export type CreateUserData = {
  email: string;
  password_hash: string;
  preferred_name?: string | null;
  subscription_status: 'active' | 'lapsed' | 'cancelled';
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  stripe_premium_item_id?: string | null;
  plan_type?: 'monthly' | 'annual' | null;
  has_premium_memory?: boolean;
  next_billing_date?: string | null;
  subscription_lapsed_at?: string | null;
};

export type UpdateUserData = Partial<Omit<CreateUserData, 'email' | 'password_hash'>> & {
  email?: string;
  password_hash?: string;
};

/**
 * Fetch a single user by their UUID.
 * Returns the User row or null if not found.
 */
export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabaseServer
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`getUserById failed: ${error.message}`);
  }

  return data as User;
}

/**
 * Fetch a single user by their email address.
 * Returns the User row or null if not found.
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabaseServer
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`getUserByEmail failed: ${error.message}`);
  }

  return data as User;
}

/**
 * Insert a new user row.
 * Returns the created User row.
 */
export async function createUser(data: CreateUserData): Promise<User> {
  const { data: created, error } = await supabaseServer
    .from('users')
    .insert(data)
    .select('*')
    .single();

  if (error) {
    throw new Error(`createUser failed: ${error.message}`);
  }

  return created as User;
}

/**
 * Update an existing user row by UUID.
 * Returns the updated User row.
 */
export async function updateUser(id: string, data: UpdateUserData): Promise<User> {
  const { data: updated, error } = await supabaseServer
    .from('users')
    .update(data)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`updateUser failed: ${error.message}`);
  }

  return updated as User;
}
