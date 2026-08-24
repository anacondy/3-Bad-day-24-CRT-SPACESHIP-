# Branch cleanup plan (do **not** auto-mass-delete)

## Diagnosis

As of the packaging PR inspection, the remote had **~99 heads**, of which **~92** matched:

```text
auto-update/<github.run_id>
```

### Exact cause

Workflow: [`.github/workflows/game-update.yml`](.github/workflows/game-update.yml) (previous version)

1. **Trigger:** `schedule: cron '0 0 */3 * *'` (every 3 days) + `workflow_dispatch`
2. **Guaranteed diff:** step “Update game version” always rewrote `version.json` with a new timestamp
3. **New branch every run:** `peter-evans/create-pull-request` used  
   `branch: auto-update/${{ github.run_id }}`  
   → unique branch name per Actions run ID
4. **`delete-branch: true`:** only deletes the head branch **after the PR is merged**.  
   Closed/unmerged/failed PRs left `auto-update/*` branches on the remote forever
5. **Permissions:** `contents: write` + `pull-requests: write` allowed the bot to push freely

Result: roughly one orphaned branch every 3 days (plus manual dispatches) → tens of spam branches.

Other non-spam heads (examples): `main`, `arena/*`, historical `copilot/*` feature branches.

## Fix applied (this PR)

The fixed workflow is shipped as:

```text
packaging/github-workflows/game-update.yml   # report-only replacement
packaging/github-workflows/release.yml       # portable package builder on tags
```

**Why not directly under `.github/workflows/` in the agent push?**  
The automation token used for this branch lacks the GitHub App `workflows` permission, so edits to `.github/workflows/*` are rejected on `git push`. Maintainers must copy the fixed files once (or merge via a fork/PR that has workflow scope).

### Maintainer one-liner (required to stop spam)

From a clone with rights to push workflow files to `main` (or this PR branch):

```bash
cp packaging/github-workflows/game-update.yml .github/workflows/game-update.yml
cp packaging/github-workflows/release.yml     .github/workflows/release.yml
git add .github/workflows/
git commit -m "ci: replace game-update with report-only workflow; add release packages workflow"
git push
```

Also recommended in the GitHub UI (immediate stop, even before the file copy):

1. Repo → **Actions** → **Game Update & Debug Analysis**
2. `⋯` menu → **Disable workflow**

The replacement workflow is **report-only**:

- **No schedule** (manual `workflow_dispatch` only)
- **No git commit / push**
- **No `create-pull-request`**
- **No `version.json` bump**
- Analysis uploaded as an **Actions artifact** only
- Permissions reduced to `contents: read`

This stops **new** spam once installed/disabled. It does **not** delete historical branches (by design).

## Recommended cleanup (maintainers, after merge)

Run from a clone with admin rights. Review the list before deleting.

```bash
# 1. List spam candidates
git ls-remote --heads origin 'refs/heads/auto-update/*'

# 2. Dry-run: print delete commands
git ls-remote --heads origin 'refs/heads/auto-update/*' \
  | awk '{print $2}' \
  | sed 's#refs/heads/##' \
  | while read b; do echo "git push origin --delete \"$b\""; done

# 3. After review, delete (batch). Prefer a few at a time.
git ls-remote --heads origin 'refs/heads/auto-update/*' \
  | awk '{print $2}' \
  | sed 's#refs/heads/##' \
  | xargs -r -n 20 git push origin --delete
```

### Also check

```bash
# Open PRs still pointing at auto-update/* (close if obsolete)
gh pr list --state open --search "head:auto-update/"

# Optional: close stale automated PRs
gh pr list --state open --label automated --json number,title,headRefName
```

### Do **not** delete without review

- `main`
- Active Arena/session branches (`arena/*`)
- Any `copilot/*` or feature branch still referenced by an open PR
- Tags or releases (there should be none required for this cleanup)

### GitHub UI alternative

Repo → **Branches** → filter `auto-update` → delete stale branches, or use **Settings → Actions** to confirm the old scheduled workflow is no longer enabled after this PR merges.

## Verification that spam has stopped

After this PR is merged to `main`:

1. Actions → “Game Update & Debug Analysis” → confirm it only runs on **workflow_dispatch**
2. Run it once manually → confirm **zero** new `auto-update/*` branches:
   ```bash
   git ls-remote --heads origin 'refs/heads/auto-update/*' | wc -l
   # count must not increase after the manual run
   ```
3. Confirm the run uploaded a `debug-analysis-*` artifact instead of opening a PR
