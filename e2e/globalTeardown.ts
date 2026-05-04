import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export default async function globalTeardown() {
  if (process.env.SKIP_STRIPE_E2E === 'true') return;

  const fixturePath = path.join(process.cwd(), 'e2e', 'fixtures', 'test-user.json');
  if (!fs.existsSync(fixturePath)) return;

  const { id } = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await supabase.from('users').delete().eq('id', id);
  fs.rmSync(fixturePath);
}
