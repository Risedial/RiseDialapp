# Module 8 — CI Pipeline: Validation Checklist

- [ ] `.github/workflows/ci.yml` exists and is committed — `git show HEAD:.github/workflows/ci.yml` exits 0
- [ ] The CI workflow defines exactly 3 jobs: `typecheck`, `unit-tests`, and `e2e-tests` — `grep "^\s*[a-z-]*:$" .github/workflows/ci.yml` returns three job names
- [ ] `unit-tests` job has `needs: typecheck` — `grep "needs: typecheck" .github/workflows/ci.yml` returns a result
- [ ] `e2e-tests` job has `needs: unit-tests` — `grep "needs: unit-tests" .github/workflows/ci.yml` returns a result
- [ ] `e2e-tests` job sets `SKIP_STRIPE_E2E: 'true'` — `grep "SKIP_STRIPE_E2E" .github/workflows/ci.yml` returns a result
- [ ] GitHub Actions shows a green checkmark for all 3 jobs on the latest push to `main` — navigate to `github.com/Risedial/RiseDialapp` > Actions > CI > latest run and observe all jobs green
- [ ] The green check is visible next to the latest commit SHA on the main branch page at `github.com/Risedial/RiseDialapp`
- [ ] All 12 GitHub repository secrets are configured — navigate to Repository > Settings > Secrets and variables > Actions and verify all 12 secret names from the SPEC are listed
- [ ] Downloading the `playwright-report` artifact from a failed e2e-tests run (if one occurs) produces an `index.html` that opens in a browser — verify artifact upload step is present: `grep "upload-artifact" .github/workflows/ci.yml` returns a result
- [ ] The pipeline completes end-to-end (all 3 jobs green) within 15 minutes of a push to main — observe total run time in the Actions UI
