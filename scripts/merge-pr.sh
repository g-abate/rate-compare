#!/bin/bash

# Solo Developer PR Merge Script
# Usage: ./scripts/merge-pr.sh [PR_NUMBER] [METHOD]
# Methods: squash, merge, rebase (default: squash)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if GitHub CLI is available
if ! command -v gh &> /dev/null; then
    echo -e "${RED}GitHub CLI (gh) is required but not installed.${NC}"
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}Please authenticate with GitHub CLI first:${NC}"
    echo "gh auth login"
    exit 1
fi

# Get PR number from argument or prompt
if [ -n "$1" ]; then
    PR_NUMBER="$1"
else
    echo -e "${BLUE}Available PRs:${NC}"
    gh pr list --state open
    echo ""
    read -p "Enter PR number to merge: " PR_NUMBER
fi

# Get merge method from argument or use default
MERGE_METHOD="${2:-squash}"

# Validate merge method
if [[ ! "$MERGE_METHOD" =~ ^(squash|merge|rebase)$ ]]; then
    echo -e "${RED}Invalid merge method: $MERGE_METHOD${NC}"
    echo "Valid methods: squash, merge, rebase"
    exit 1
fi

echo -e "${BLUE}Checking PR #$PR_NUMBER...${NC}"

# Get PR details
PR_INFO=$(gh pr view $PR_NUMBER --json state,mergeable,statusCheckRollup,title,author)
PR_STATE=$(echo "$PR_INFO" | jq -r '.state')
PR_MERGEABLE=$(echo "$PR_INFO" | jq -r '.mergeable')
PR_TITLE=$(echo "$PR_INFO" | jq -r '.title')
PR_AUTHOR=$(echo "$PR_INFO" | jq -r '.author.login')

echo "Title: $PR_TITLE"
echo "Author: $PR_AUTHOR"
echo "State: $PR_STATE"
echo "Mergeable: $PR_MERGEABLE"

# Check if PR is open
if [ "$PR_STATE" != "OPEN" ]; then
    echo -e "${RED}❌ PR is not open (state: $PR_STATE)${NC}"
    exit 1
fi

# Check if PR is mergeable
if [ "$PR_MERGEABLE" != "true" ]; then
    echo -e "${RED}❌ PR is not mergeable${NC}"
    echo "This could be due to:"
    echo "- Merge conflicts"
    echo "- Failing status checks"
    echo "- Branch protection rules"
    exit 1
fi

# Check status checks
echo -e "${BLUE}Checking status checks...${NC}"
STATUS_CHECKS=$(echo "$PR_INFO" | jq -r '.statusCheckRollup[]?.conclusion // empty')
FAILED_CHECKS=$(echo "$STATUS_CHECKS" | grep -v "SUCCESS" | grep -v "PENDING" | head -1)

if [ -n "$FAILED_CHECKS" ]; then
    echo -e "${RED}❌ Some status checks are failing:${NC}"
    echo "$FAILED_CHECKS"
    echo ""
    echo "Please fix the failing checks before merging."
    exit 1
fi

echo -e "${GREEN}✅ All checks passed!${NC}"

# Confirm merge
echo ""
echo -e "${YELLOW}Ready to merge PR #$PR_NUMBER using $MERGE_METHOD method${NC}"
echo "Title: $PR_TITLE"
echo ""
read -p "Are you sure you want to merge? (y/N): " confirm

if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Merge cancelled.${NC}"
    exit 0
fi

# Merge the PR
echo -e "${BLUE}Merging PR #$PR_NUMBER...${NC}"

if gh pr merge $PR_NUMBER --$MERGE_METHOD --delete-branch; then
    echo -e "${GREEN}🎉 PR #$PR_NUMBER merged successfully!${NC}"
    echo -e "${GREEN}✅ Branch deleted after merge${NC}"
    
    # Add a comment to the PR
    gh pr comment $PR_NUMBER --body "🎉 **PR merged successfully!**

- **Merged by**: @$(gh api user --jq '.login')
- **Method**: $MERGE_METHOD
- **Branch**: Deleted after merge

Great work! 🚀"
    
else
    echo -e "${RED}❌ Failed to merge PR${NC}"
    exit 1
fi
