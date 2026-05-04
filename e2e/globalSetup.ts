import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export default async function globalSetup() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const uniqueHex = crypto.randomBytes(4).toString('hex');
  const email = `${uniqueHex}@risedial-test.com`;
  const password = 'TestPassword123!';
  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('users')
    .insert({ email, password_hash, subscription_status: 'active' })
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
