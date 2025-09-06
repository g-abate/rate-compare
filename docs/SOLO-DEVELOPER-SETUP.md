# Solo Developer Setup Guide

This guide helps solo developers set up their GitHub repository for efficient development without manual PR approval requirements.

## 🚀 Quick Setup

### 1. Disable Branch Protection (Recommended for Solo Dev)

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Branches**
3. If there are any branch protection rules for `main`, **delete them**
4. This allows you to merge PRs directly without approval

### 2. Enable Auto-merge (Optional)

1. Go to **Settings** → **General** → **Pull Requests**
2. Check **"Allow auto-merge"**
3. This lets you enable auto-merge on individual PRs

### 3. Use the Merge Script

We've provided a convenient script to merge PRs:

```bash
# Merge a specific PR
./scripts/merge-pr.sh 123

# Merge with specific method
./scripts/merge-pr.sh 123 squash

# Interactive mode (will show available PRs)
./scripts/merge-pr.sh
```

## 🔧 Available Merge Methods

- **squash** (default): Combines all commits into one
- **merge**: Creates a merge commit
- **rebase**: Replays commits on top of main

## 🤖 Automated Workflows

### Auto-merge Workflow
The `.github/workflows/auto-merge.yml` will automatically merge PRs when:
- All required checks pass
- PR is not a draft
- You are the author

### Manual Merge Workflow
The `.github/workflows/solo-developer-merge.yml` provides a manual merge option via GitHub Actions.

## 📋 Recommended Workflow

1. **Create feature branch**:
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes and commit**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Push and create PR**:
   ```bash
   git push -u origin feature/my-feature
   gh pr create --title "Add new feature" --body "Description"
   ```

4. **Wait for CI checks** to pass

5. **Merge using script**:
   ```bash
   ./scripts/merge-pr.sh [PR_NUMBER]
   ```

## ⚠️ Important Notes

- **Always run tests locally** before pushing
- **Review your own PRs** before merging
- **Use meaningful commit messages**
- **Keep PRs focused** and small when possible

## 🛡️ Safety Features

The merge script includes several safety checks:
- ✅ Verifies PR is open and mergeable
- ✅ Checks all status checks are passing
- ✅ Confirms merge before proceeding
- ✅ Automatically deletes branch after merge
- ✅ Adds merge confirmation comment

## 🔍 Troubleshooting

### "PR is not mergeable"
- Check for merge conflicts
- Ensure all status checks are passing
- Verify branch protection rules aren't blocking

### "Some status checks are failing"
- Fix the failing checks first
- Re-run the workflow if needed
- Check the Actions tab for details

### Script not working
- Ensure GitHub CLI is installed: `gh --version`
- Authenticate with GitHub: `gh auth login`
- Check you have write permissions to the repository

## 🎯 Best Practices

1. **Use feature branches** for all changes
2. **Write tests** for new functionality
3. **Keep commits atomic** and well-described
4. **Review your own code** before merging
5. **Use conventional commit messages**

## 📚 Additional Resources

- [GitHub CLI Documentation](https://cli.github.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
