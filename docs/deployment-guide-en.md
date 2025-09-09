# 🚀 Deployment Guide - Automatic Versioning

This guide explains how to use the automatic versioning system to deploy on the `main` branch with different version types (MAJOR, MINOR, PATCH).

## 📋 Table of Contents

- [Overview](#overview)
- [Commit Convention](#commit-convention)
- [Version Types](#version-types)
- [Deployment Process](#deployment-process)
- [Practical Examples](#practical-examples)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The system automatically analyzes your commits since the last tag to determine the version type to apply according to [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (X.Y.0): New backward-compatible features
- **PATCH** (X.Y.Z): Bug fixes

**🆕 First deployment:** If no tag exists, the system starts with `v0.0.1`, `v0.1.0` or `v1.0.0` depending on the type of commits detected.

## 📝 Commit Convention

For the system to work correctly, use these prefixes in your commit messages:

### ✨ New Features (MINOR)
```bash
feat: add OAuth authentication
feature: implement notification system
```

### 🐛 Bug Fixes (PATCH)
```bash
fix: correct calendar display
bugfix: resolve database connection issue
```

### 💥 Breaking Changes (MAJOR)
```bash
BREAKING CHANGE: modify user API
breaking: remove old auth system
```

### 📚 Documentation and Others (PATCH)
```bash
docs: update README
style: fix indentation
refactor: restructure code
test: add unit tests
chore: update dependencies
```

## 🔄 Version Types

### 🔴 MAJOR (X.0.0)
**When to use:** Changes that break compatibility

**Triggers:**
- Message containing `BREAKING CHANGE`
- Message containing `breaking:`

**Examples:**
- Public API modification
- Feature removal
- Incompatible database structure change

### 🟡 MINOR (X.Y.0)
**When to use:** New backward-compatible features

**Triggers:**
- Message containing `feat` or `feature:`

**Examples:**
- New page or component
- New API endpoint
- New user feature

### 🟢 PATCH (X.Y.Z)
**When to use:** Minor fixes and improvements

**Triggers:**
- All other commit types
- Messages containing `fix`, `docs`, `style`, etc.

**Examples:**
- Bug fixes
- Documentation updates
- Performance optimizations

## 🚀 Deployment Process

### Step 1: Development and commits
```bash
# Make your changes
git add .
git commit -m "feat: add notification system"

# Push to your development branch
git push origin feature/notifications
```

### Step 2: Merge Request to main
1. Create a Merge Request to `main`
2. Have the code reviewed
3. Merge the MR

### Step 3: Trigger versioning
1. Go to GitLab CI/CD → Pipelines
2. Locate the pipeline on `main`
3. Click on the `analyze_version` job
4. Click "Play" (▶️) to run manually

### Step 4: Automatic verification
The system will automatically:
- ✅ Analyze commits since the last tag
- ✅ Determine the version type
- ✅ Generate the changelog
- ✅ Create the Git tag
- ✅ Build the Docker image with the correct tag
- ✅ Push everything to the registry

## 📖 Practical Examples

### Example 0: First deployment (no existing tag)
```bash
# No tag exists yet in the project
git tag -l
# (no results)

# Commits since the beginning of the project
git log --oneline
# feat: add task system
# fix: correct database configuration
# docs: add README

# Result: Version 0.1.0 (MINOR because there's feat:)
# If only fix/docs: Version 0.0.1 (PATCH)
# If BREAKING CHANGE: Version 1.0.0 (MAJOR)
```

### Example 1: PATCH deployment
```bash
# Commits since last tag v1.2.0
git log v1.2.0..HEAD --oneline
# fix: correct calendar display bug
# docs: update README

# Result: Version 1.2.1 (PATCH)
```

### Example 2: MINOR deployment
```bash
# Commits since last tag v1.2.1
git log v1.2.1..HEAD --oneline
# feat: add PDF export
# fix: correct form validation

# Result: Version 1.3.0 (MINOR)
```

### Example 3: MAJOR deployment
```bash
# Commits since last tag v1.3.0
git log v1.3.0..HEAD --oneline
# BREAKING CHANGE: modify user API structure
# feat: new authentication system

# Result: Version 2.0.0 (MAJOR)
```

## 🔧 Deployment Configuration

### Environment Variables
Your `docker-compose.prod.yml` already uses the `DOCKER_IMAGE` variable:

```bash
# Deploy a specific version
DOCKER_IMAGE=lab.frogg.it:5050/grind-apps/rapid-work-tracker:v1.3.0 \
docker-compose -f docker-compose.prod.yml up -d

# Deploy the latest version
DOCKER_IMAGE=lab.frogg.it:5050/grind-apps/rapid-work-tracker:latest \
docker-compose -f docker-compose.prod.yml up -d
```

### .env file for production
Create a `.env` file:
```env
DOCKER_IMAGE=lab.frogg.it:5050/grind-apps/rapid-work-tracker:latest
TZ=Europe/Paris
PORT=3333
NODE_ENV=production
# ... other variables
```

## 🛠️ Troubleshooting

### Issue: The analyze_version job doesn't start
**Solution:** Check that you're on the `main` branch and run manually

### Issue: Wrong version type detected
**Cause:** Commit convention not followed
**Solution:** Use the correct prefixes (`feat:`, `fix:`, `BREAKING CHANGE:`)

### Issue: Tag already exists
**Cause:** Attempt to create an existing tag
**Solution:** The system automatically increments, check the logs

### Issue: Docker image not found
**Cause:** Tag not yet pushed or incorrect name
**Solution:** Check the GitLab registry and use the correct tag

### Question: First project version
**Answer:** The system starts with v0.0.1 (PATCH), v0.1.0 (MINOR) or v1.0.0 (MAJOR) depending on your commits

## 📊 Version Tracking

### View existing tags
```bash
git tag -l
# v1.0.0
# v1.1.0
# v1.2.0
```

### View the changelog
The `CHANGELOG.md` file is automatically generated and maintained.

### View Docker images
In GitLab: Container Registry → rapid-work-tracker

## 🎯 Best Practices

1. **Atomic commits**: One commit = one feature/fix
2. **Clear messages**: Use the commit convention
3. **Test before merge**: Make sure everything works
4. **Code review**: Have your changes reviewed
5. **Documentation**: Update docs if necessary

## 🔗 Useful Links

- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)

---

**💡 Tip:** To force a specific version type, make sure your commit contains the right prefix. For example, even for a small feature, use `feat:` if you want a MINOR version.
