import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export default async function globalTeardown() {
  const fixturePath = path.join(process.cwd(), 'e2e', 'fixtures', 'test-user.json');
  if (!fs.existsSync(fixturePath)) return;

  const { id } = JSON.parse(fs.readFileSync(fixturePath, 'utf-8')) as { id: string; email: string; password: string };

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await supabase.from('users').delete().eq('id', id);
  fs.unlinkSync(fixturePath);
}
