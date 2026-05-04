import { getUserById } from '../db/users';

export interface SubscriptionGateResult {
  allowed: boolean;
  status: string;
}

/**
 * Checks whether a user is permitted to access Rise based on their
 * subscription_status. Returns a structured result — never throws.
 *
 * allowed === true  only when subscription_status === 'active'
 * allowed === false for 'lapsed', 'cancelled', or any database error
 */
export async function requireActiveSubscription(
  userId: string
): Promise<SubscriptionGateResult> {
  try {
    const user = await getUserById(userId);

    if (!user) {
      return { allowed: false, status: 'not_found' };
    }

    if (user.subscription_status === 'active') {
      return { allowed: true, status: 'active' };
    }

    return { allowed: false, status: user.subscription_status };
  } catch {
    return { allowed: false, status: 'error' };
  }
}
