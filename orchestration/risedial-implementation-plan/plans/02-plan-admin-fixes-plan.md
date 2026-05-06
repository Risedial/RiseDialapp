## Plan: Admin Signin Upsert (Plan B-2)

**Scope:** Insert try/catch upsert block in app/api/auth/signin/route.ts to re-set subscription_status and has_premium_memory on every admin login.

**Target file:** C:\Users\Alexb\Documents\RiseDialapp\app\api\auth\signin\route.ts

**Target location:** After the closing } of `if (!adminUser)` guard and before `let sessionToken: string;` (lines 55–62 per admin-locations.md)

**Before state:** (verbatim from admin-facts.md)
```
      if (!adminUser) {
        return NextResponse.json(
          { success: false, error: 'Admin account not found. Sign up first with your admin email.' },
          { status: 401 }
        );
      }

      let sessionToken: string;
```

**After state:** (exact replacement — adds the try/catch upsert block between the guard and sessionToken)
```
      if (!adminUser) {
        return NextResponse.json(
          { success: false, error: 'Admin account not found. Sign up first with your admin email.' },
          { status: 401 }
        );
      }

      // Keep admin DB row in sync — Stripe webhooks can reset these fields
      try {
        await supabaseServer
          .from('users')
          .update({ subscription_status: 'active', has_premium_memory: true })
          .eq('id', adminUser.id);
      } catch {
        // Non-fatal: session still created even if this update fails
      }

      let sessionToken: string;
```

**Verification test:** Read the file after edit. Confirm the string "Keep admin DB row in sync" appears in the file. Run `npx tsc --noEmit` from C:\Users\Alexb\Documents\RiseDialapp — must exit 0.

**DO NOT TOUCH:** (no protected files)
