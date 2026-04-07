# GitHub Repository Setup

## Create repository and push

```bash
cd ~/TubeAI

# Initialize git repo
git init

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/tubeai.git

# Create initial commit
git add .
git commit -m "chore: initial commit - TubeAI SaaS platform"

# Push to main branch
git branch -M main
git push -u origin main
```

## Branch workflow

```bash
# Create feature branch
git checkout -b feature/add-export

# Make changes, commit
git add .
git commit -m "feat: add PDF export for generated scripts"

# Push branch
git push origin feature/add-export

# Merge to main (via PR or directly)
git checkout main
git merge feature/add-export
git push origin main
```
