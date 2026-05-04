import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export default async function globalSetup() {
  if (process.env.SKIP_STRIPE_E2E === 'true') return;

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const email = `e2e-test-${Date.now()}@risedial.test`;
  const password = 'TestPassword123!';

  const { data, error } = await supabase
    .from('users')
    .insert({ email, password_hash: 'hashed_placeholder', subscription_status: 'active' })
    .select('id, email')
    .single();

  if (error) throw error;

  const fixturesDir = path.join(process.cwd(), 'e2e', 'fixtures');
  fs.mkdirSync(fixturesDir, { recursive: true });
  fs.writeFileSync(
    path.join(fixturesDir, 'test-user.json'),
    JSON.stringify({ id: data.id, email: data.email, password })
  );
}
