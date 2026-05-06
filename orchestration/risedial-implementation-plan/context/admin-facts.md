# Admin Context Facts

## File
`C:\Users\Alexb\Documents\RiseDialapp\app\api\auth\signin\route.ts`

## supabaseServer Import Line
- **Line number:** 6
- **Exact text:** `import { supabaseServer } from '@/lib/supabase/server';`

## Admin Bypass Block (verbatim)
Lines 55–62, from `if (!adminUser)` through `let sessionToken: string;`:

```
      if (!adminUser) {
        return NextResponse.json(
          { success: false, error: 'Admin account not found. Sign up first with your admin email.' },
          { status: 401 }
        );
      }

      let sessionToken: string;
```

## Indentation of Surrounding Code
- **Spaces before `if (!adminUser) {`:** 6 spaces
