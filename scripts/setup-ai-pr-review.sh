#!/bin/bash

# AI PR Review Setup Script for Rate Compare Plugin
# This script helps configure the AI PR review workflow

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}AI PR Review Setup Script${NC}"
echo "============================="

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

echo -e "${GREEN}GitHub CLI authenticated successfully${NC}"

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree &> /dev/null; then
    echo -e "${RED}Not in a git repository. Please run this from the project root.${NC}"
    exit 1
fi

# Get repository information
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo -e "${BLUE}Repository: $REPO${NC}"

# Check if AI PR review workflow exists
if [ ! -f ".github/workflows/ai-pr-review.yml" ]; then
    echo -e "${RED}AI PR review workflow not found. Please ensure .github/workflows/ai-pr-review.yml exists.${NC}"
    exit 1
fi

echo -e "${GREEN}AI PR review workflow found${NC}"

# API Key setup
echo ""
echo -e "${BLUE}Setting up AI API Key...${NC}"
echo ""
echo "Choose your AI provider:"
echo "1) Amp (Recommended - Free $10 credit)"
echo "2) Claude Code (Anthropic)"
echo "3) Skip API key setup"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo -e "${YELLOW}Setting up Amp API Key:${NC}"
        echo "1. Visit https://ampcode.com and create a free account"
        echo "2. Go to https://ampcode.com/settings"
        echo "3. Generate a new API key"
        echo "4. Copy the API key (starts with 'sgamp_')"
        echo ""
        read -p "Enter your Amp API key: " api_key
        
        if [[ $api_key =~ ^sgamp_ ]]; then
            gh secret set AMP_API_KEY -b "$api_key"
            echo -e "${GREEN}Amp API key set successfully!${NC}"
        else
            echo -e "${RED}Invalid API key format. Expected format: sgamp_xxxxxxxx${NC}"
            exit 1
        fi
        ;;
    2)
        echo ""
        echo -e "${YELLOW}Setting up Claude Code API Key:${NC}"
        echo "1. Visit https://console.anthropic.com"
        echo "2. Sign up or log in to your account"
        echo "3. Navigate to API Keys section"
        echo "4. Create a new API key"
        echo "5. Copy the API key (starts with 'sk-ant-')"
        echo ""
        read -p "Enter your Claude Code API key: " api_key
        
        if [[ $api_key =~ ^sk-ant- ]]; then
            gh secret set ANTHROPIC_API_KEY -b "$api_key"
            echo -e "${GREEN}Claude Code API key set successfully!${NC}"
        else
            echo -e "${RED}Invalid API key format. Expected format: sk-ant-xxxxxxxx${NC}"
            exit 1
        fi
        ;;
    3)
        echo -e "${YELLOW}Skipping API key setup. You can set it manually later.${NC}"
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

# Commit the workflow if not already committed
if ! git diff --quiet HEAD -- .github/workflows/ai-pr-review.yml; then
    echo ""
    echo -e "${BLUE}Committing AI PR review workflow...${NC}"
    git add .github/workflows/ai-pr-review.yml
    git commit -m "feat: add AI PR review workflow

- Implemented SnarkTank AI PR review workflow
- Customized for WordPress plugin development
- Added WordPress-specific security and standards checks
- Configured for Amp and Claude Code AI providers
- Added AGENT.md for AI context and guidelines

Related to AI PR review integration"
    
    echo -e "${GREEN}Workflow committed successfully!${NC}"
else
    echo -e "${GREEN}Workflow already committed${NC}"
fi

# Push to remote
echo ""
echo -e "${BLUE}Pushing changes to remote...${NC}"
git push origin main

echo ""
echo -e "${GREEN}🎉 AI PR Review setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Create a test pull request to verify the workflow"
echo "2. Check the Actions tab to see the AI review in action"
echo "3. The AI will review all future pull requests automatically"
echo ""
echo "Test the setup:"
echo "git checkout -b test-ai-review"
echo "echo '# Test AI Review' >> README.md"
echo "git add README.md && git commit -m 'test: trigger AI review'"
echo "git push -u origin test-ai-review"
echo "gh pr create --title 'Test AI Review' --body 'Testing the AI review workflow'"
echo ""
echo -e "${BLUE}Repository: https://github.com/$REPO${NC}"
echo -e "${BLUE}Actions: https://github.com/$REPO/actions${NC}"
