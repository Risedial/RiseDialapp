# Module 1 — Build Error Resolution: Validation Checklist

- [ ] `npx tsc --noEmit` exits with code 0 and produces zero lines of output
- [ ] `npx next build` exits with code 0 with no errors in the output
- [ ] `tsconfig.tsbuildinfo` does not exist in the project root (deleted and added to `.gitignore`)
- [ ] `git log --oneline -5` shows a commit with message starting with `fix:` covering TypeScript errors and build blockers
- [ ] No file in the project (outside `node_modules`) contains `import ... from 'jsonwebtoken'` unless it is inside a conditional block that only executes in a Node.js-only context
- [ ] Running `grep -r "PREMIUM_PRODUCT_ID" --include="*.ts" --include="*.tsx" src/ app/ lib/` returns zero results
- [ ] `tsconfig.json` does not list any path under `orchestration/` in `include` or list it without `exclude` coverage
- [ ] The output of `npx next build` shows no red error lines — only green "✓ Compiled" and route size table
