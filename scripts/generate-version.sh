#!/bin/bash
set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions for colored output
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Configuration
OUTPUT_FILE="version.env"
CHANGELOG_FILE="CHANGELOG.md"
TEMP_CHANGELOG="CHANGELOG_TEMP.md"

# Clean up function
cleanup() {
    rm -f "$TEMP_CHANGELOG"
}
trap cleanup EXIT

main() {
    log_info "Starting automatic versioning and changelog generation"
    
    # Get the last tag or set default
    LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
    log_info "Last tag: $LAST_TAG"
    
    # Get commits since last tag
    if [ "$LAST_TAG" = "v0.0.0" ]; then
        COMMITS=$(git log --oneline --pretty=format:"%s")
        log_info "Analyzing all commits (no previous tag found)"
    else
        COMMITS=$(git log ${LAST_TAG}..HEAD --oneline --pretty=format:"%s")
        log_info "Analyzing commits since $LAST_TAG"
    fi
    
    if [ -z "$COMMITS" ]; then
        log_warning "No new commits found since last tag"
        exit 0
    fi
    
    echo "Commits to analyze:"
    echo "$COMMITS"
    echo ""
    
    # Determine version type based on commits
    VERSION_TYPE="patch"
    
    # Check for breaking changes (MAJOR)
    if echo "$COMMITS" | grep -i "BREAKING CHANGE\|breaking:" >/dev/null; then
        VERSION_TYPE="major"
        log_info "🔴 BREAKING CHANGE detected → MAJOR version"
    # Check for new features (MINOR)
    elif echo "$COMMITS" | grep -i "feat\|feature:" >/dev/null; then
        VERSION_TYPE="minor"
        log_info "🟡 New features detected → MINOR version"
    # Otherwise it's a PATCH (bugfix, docs, etc.)
    else
        log_info "🟢 Only fixes/docs detected → PATCH version"
    fi
    
    echo "VERSION_TYPE=$VERSION_TYPE" > "$OUTPUT_FILE"
    
    # Calculate new version
    if [ "$LAST_TAG" = "v0.0.0" ]; then
        CURRENT_VERSION="0.0.0"
    else
        CURRENT_VERSION=${LAST_TAG#v}
    fi
    
    IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
    
    case $VERSION_TYPE in
        major)
            MAJOR=$((MAJOR + 1))
            MINOR=0
            PATCH=0
            ;;
        minor)
            MINOR=$((MINOR + 1))
            PATCH=0
            ;;
        patch)
            PATCH=$((PATCH + 1))
            ;;
    esac
    
    NEW_VERSION="$MAJOR.$MINOR.$PATCH"
    NEW_TAG="v$NEW_VERSION"
    
    log_success "New version: $NEW_VERSION"
    log_success "New tag: $NEW_TAG"
    
    echo "NEW_VERSION=$NEW_VERSION" >> "$OUTPUT_FILE"
    echo "NEW_TAG=$NEW_TAG" >> "$OUTPUT_FILE"
    
    # Generate changelog
    generate_changelog "$NEW_VERSION" "$COMMITS"
    
    # Create tag and push
    create_and_push_tag "$NEW_TAG" "$NEW_VERSION"
    
    log_success "Versioning and changelog generation completed!"
}

generate_changelog() {
    local new_version="$1"
    local commits="$2"
    
    log_info "Generating changelog for version $new_version"
    
    cat > "$TEMP_CHANGELOG" << EOF
# Changelog

## [$new_version] - $(date +%Y-%m-%d)

EOF
    
    # Categorize commits
    local has_content=false
    
    # Breaking changes
    if echo "$commits" | grep -i "BREAKING CHANGE\|breaking:" >/dev/null; then
        echo "### 💥 Breaking Changes" >> "$TEMP_CHANGELOG"
        echo "$commits" | grep -i "BREAKING CHANGE\|breaking:" | sed 's/^/- /' >> "$TEMP_CHANGELOG"
        echo "" >> "$TEMP_CHANGELOG"
        has_content=true
    fi
    
    # New features
    if echo "$commits" | grep -i "feat\|feature:" >/dev/null; then
        echo "### ✨ New Features" >> "$TEMP_CHANGELOG"
        echo "$commits" | grep -i "feat\|feature:" | sed 's/^/- /' >> "$TEMP_CHANGELOG"
        echo "" >> "$TEMP_CHANGELOG"
        has_content=true
    fi
    
    # Bug fixes
    if echo "$commits" | grep -i "fix\|bugfix:" >/dev/null; then
        echo "### 🐛 Bug Fixes" >> "$TEMP_CHANGELOG"
        echo "$commits" | grep -i "fix\|bugfix:" | sed 's/^/- /' >> "$TEMP_CHANGELOG"
        echo "" >> "$TEMP_CHANGELOG"
        has_content=true
    fi
    
    # Documentation
    if echo "$commits" | grep -i "docs:" >/dev/null; then
        echo "### 📚 Documentation" >> "$TEMP_CHANGELOG"
        echo "$commits" | grep -i "docs:" | sed 's/^/- /' >> "$TEMP_CHANGELOG"
        echo "" >> "$TEMP_CHANGELOG"
        has_content=true
    fi
    
    # Other improvements
    local other_commits=$(echo "$commits" | grep -v -i "feat\|feature:\|fix\|bugfix:\|docs:\|BREAKING CHANGE\|breaking:")
    if [ -n "$other_commits" ]; then
        echo "### 🔧 Other Improvements" >> "$TEMP_CHANGELOG"
        echo "$other_commits" | sed 's/^/- /' >> "$TEMP_CHANGELOG"
        echo "" >> "$TEMP_CHANGELOG"
        has_content=true
    fi
    
    if [ "$has_content" = false ]; then
        echo "- Version $new_version" >> "$TEMP_CHANGELOG"
        echo "" >> "$TEMP_CHANGELOG"
    fi
    
    # Merge with existing changelog
    if [ -f "$CHANGELOG_FILE" ]; then
        # Keep header and add new version
        head -n 2 "$CHANGELOG_FILE" > "${CHANGELOG_FILE}.new" 2>/dev/null || echo "# Changelog" > "${CHANGELOG_FILE}.new"
        echo "" >> "${CHANGELOG_FILE}.new"
        tail -n +3 "$TEMP_CHANGELOG" >> "${CHANGELOG_FILE}.new"
        
        # Add existing content if there was any
        if [ -s "$CHANGELOG_FILE" ] && [ $(wc -l < "$CHANGELOG_FILE") -gt 2 ]; then
            tail -n +3 "$CHANGELOG_FILE" >> "${CHANGELOG_FILE}.new"
        fi
        
        mv "${CHANGELOG_FILE}.new" "$CHANGELOG_FILE"
    else
        mv "$TEMP_CHANGELOG" "$CHANGELOG_FILE"
    fi
    
    log_success "Changelog updated in $CHANGELOG_FILE"
}

create_and_push_tag() {
    local new_tag="$1"
    local new_version="$2"
    
    log_info "Creating commit and tag for $new_tag"
    
    # Add changelog to git
    git add "$CHANGELOG_FILE"
    
    # Create commit (only if there are changes)
    if ! git diff --cached --quiet; then
        git commit -m "chore: release $new_tag

- Update CHANGELOG.md with version $new_version
- Automatic version bump by CI/CD pipeline" || true
    fi
    
    # Create tag
    git tag -a "$new_tag" -m "Release $new_version

Automatic release generated by CI/CD pipeline.
See CHANGELOG.md for details."
    
    # Push commit and tag
    git push origin HEAD:${CI_COMMIT_BRANCH:-main}
    git push origin "$new_tag"
    
    log_success "Tag $new_tag created and pushed"
}

# Run main function
main "$@"
