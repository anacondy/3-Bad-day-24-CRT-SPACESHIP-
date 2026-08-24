# Fixed GitHub Actions workflows

Copy these into `.github/workflows/` on a machine/token that is allowed to
modify workflow files (the Arena push token cannot update `workflows` scope).

```bash
cp packaging/github-workflows/game-update.yml .github/workflows/game-update.yml
cp packaging/github-workflows/release.yml     .github/workflows/release.yml
```

| File | Purpose |
|------|---------|
| `game-update.yml` | Replaces the spammy scheduled PR bot with **report-only** analysis |
| `release.yml` | Builds portable Win/macOS/Linux/Web zips on `v*` tags |

See [BRANCH_CLEANUP.md](../../BRANCH_CLEANUP.md) for full diagnosis and branch deletion plan.
