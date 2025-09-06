#!/bin/bash

# GitHub Repository Setup Script for Rate Compare Plugin
# This script creates a GitHub repository and sets up branch protection rules

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_NAME="rate-compare"
REPO_DESCRIPTION="WordPress plugin for comparing short-term rental rates across multiple booking channels"
REPO_VISIBILITY="public" # or "private"

echo -e "${BLUE}GitHub Repository Setup Script${NC}"
echo "=================================="

# Check if GitHub token is provided
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${YELLOW}GitHub Personal Access Token required!${NC}"
    echo ""
    echo "To create a token:"
    echo "1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)"
    echo "2. Click 'Generate new token (classic)'"
    echo "3. Give it a name like 'Rate Compare Plugin Setup'"
    echo "4. Select scopes: repo, admin:org (if needed)"
    echo "5. Copy the token"
    echo ""
    echo "Then run:"
    echo "export GITHUB_TOKEN=your_token_here"
    echo "./scripts/setup-github-repo.sh"
    echo ""
    exit 1
fi

# Check if user is authenticated
echo -e "${BLUE}Checking GitHub authentication...${NC}"
USER_INFO=$(curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user)
USERNAME=$(echo "$USER_INFO" | jq -r '.login')

if [ "$USERNAME" = "null" ]; then
    echo -e "${RED}Authentication failed. Please check your GitHub token.${NC}"
    exit 1
fi

echo -e "${GREEN}Authenticated as: $USERNAME${NC}"

# Create repository
echo -e "${BLUE}Creating repository '$REPO_NAME'...${NC}"
REPO_DATA=$(cat <<EOF
{
  "name": "$REPO_NAME",
  "description": "$REPO_DESCRIPTION",
  "private": false,
  "auto_init": false,
  "gitignore_template": "",
  "license_template": "",
  "allow_squash_merge": true,
  "allow_merge_commit": false,
  "allow_rebase_merge": true,
  "delete_branch_on_merge": true
}
EOF
)

REPO_RESPONSE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -X POST \
  -d "$REPO_DATA" \
  https://api.github.com/user/repos)

REPO_URL=$(echo "$REPO_RESPONSE" | jq -r '.clone_url')
REPO_SSH_URL=$(echo "$REPO_RESPONSE" | jq -r '.ssh_url')

if [ "$REPO_URL" = "null" ]; then
    echo -e "${RED}Failed to create repository. Response:${NC}"
    echo "$REPO_RESPONSE" | jq '.'
    exit 1
fi

echo -e "${GREEN}Repository created successfully!${NC}"
echo "Repository URL: $REPO_URL"

# Add remote origin
echo -e "${BLUE}Adding remote origin...${NC}"
git remote add origin "$REPO_URL" 2>/dev/null || git remote set-url origin "$REPO_URL"
echo -e "${GREEN}Remote origin added!${NC}"

# Push to GitHub
echo -e "${BLUE}Pushing code to GitHub...${NC}"
git push -u origin main
echo -e "${GREEN}Code pushed successfully!${NC}"

# Wait a moment for the repository to be fully initialized
echo -e "${BLUE}Waiting for repository to initialize...${NC}"
sleep 5

# Set up branch protection rules
echo -e "${BLUE}Setting up branch protection rules...${NC}"
PROTECTION_DATA=$(cat <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["required-checks"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF
)

PROTECTION_RESPONSE=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -X PUT \
  -d "$PROTECTION_DATA" \
  "https://api.github.com/repos/$USERNAME/$REPO_NAME/branches/main/protection")

if echo "$PROTECTION_RESPONSE" | jq -e '.url' > /dev/null; then
    echo -e "${GREEN}Branch protection rules set up successfully!${NC}"
else
    echo -e "${YELLOW}Warning: Branch protection setup may have failed. Response:${NC}"
    echo "$PROTECTION_RESPONSE" | jq '.'
fi

# Create issues template
echo -e "${BLUE}Setting up issue templates...${NC}"
mkdir -p .github/ISSUE_TEMPLATE

# Bug report template
cat > .github/ISSUE_TEMPLATE/bug_report.md << 'EOF'
---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - WordPress Version: [e.g. 6.4]
 - PHP Version: [e.g. 8.1]
 - Plugin Version: [e.g. 1.0.0]
 - Browser: [e.g. chrome, safari]

**Additional context**
Add any other context about the problem here.
EOF

# Feature request template
cat > .github/ISSUE_TEMPLATE/feature_request.md << 'EOF'
---
name: Feature request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
EOF

# Commit and push templates
git add .github/ISSUE_TEMPLATE/
git commit -m "feat: add GitHub issue templates" -m "- Added bug report template" -m "- Added feature request template" -m "Related to T1.3 in PRD"
git push origin main

echo -e "${GREEN}Issue templates added!${NC}"

echo ""
echo -e "${GREEN}🎉 GitHub repository setup complete!${NC}"
echo ""
echo "Repository: https://github.com/$USERNAME/$REPO_NAME"
echo "Clone URL: $REPO_URL"
echo "SSH URL: $REPO_SSH_URL"
echo ""
echo "Branch protection rules are active on the main branch."
echo "All pull requests will require:"
echo "- At least 1 reviewer approval"
echo "- Status checks to pass"
echo "- Up-to-date branches"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Visit your repository: https://github.com/$USERNAME/$REPO_NAME"
echo "2. Verify branch protection rules are active"
echo "3. Test the required status checks workflow"
echo "4. Continue with plugin development!"
