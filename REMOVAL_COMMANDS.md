# DibDab Package Removal - Quick Reference

This document provides the specific commands to execute the package removal plan.

**IMPORTANT:** Before executing any removals:
1. Create a backup branch: `git checkout -b backup/pre-spring-clean`
2. Review `/home/user/dibdab/SPRING_CLEAN_PLAN.md` thoroughly
3. Commit current state
4. Create working branch: `git checkout -b dibdab/spring-clean`

---

## Option A: Minimal Removal (Recommended First Step)

**Removes:** 21 packages (~34% reduction)
**Risk Level:** LOW

### 1. Remove Deprecated Packages Directory

```bash
# Remove entire deprecated directory
rm -rf /home/user/dibdab/packages-deprecated/

# Update .gitignore if needed
```

### 2. Remove Social Media Embeds

```bash
rm -rf /home/user/dibdab/packages/extension-youtube/
rm -rf /home/user/dibdab/packages/extension-twitch/
rm -rf /home/user/dibdab/packages/extension-audio/
```

### 3. Remove Vue 2 (Legacy)

```bash
rm -rf /home/user/dibdab/packages/vue-2/
rm -rf /home/user/dibdab/packages/extension-drag-handle-vue-2/
```

### 4. Remove Specialized Extensions

```bash
rm -rf /home/user/dibdab/packages/extension-mathematics/
rm -rf /home/user/dibdab/packages/extension-emoji/
rm -rf /home/user/dibdab/packages/extension-invisible-characters/
```

### 5. Update Workspace

```bash
# From repository root
pnpm install
```

---

## Option B: Aggressive Removal (Full Clean)

**Removes:** 35 packages (~57% reduction)
**Risk Level:** MEDIUM

Execute all commands from Option A, plus:

### 6. Remove Vue 3

```bash
rm -rf /home/user/dibdab/packages/vue-3/
rm -rf /home/user/dibdab/packages/extension-drag-handle-vue-3/
```

### 7. Remove Collaboration

```bash
rm -rf /home/user/dibdab/packages/extension-collaboration/
rm -rf /home/user/dibdab/packages/extension-collaboration-caret/
```

### 8. Remove Advanced Features

```bash
rm -rf /home/user/dibdab/packages/extension-table-of-contents/
rm -rf /home/user/dibdab/packages/extension-mention/
rm -rf /home/user/dibdab/packages/extension-typography/
rm -rf /home/user/dibdab/packages/extension-subscript/
rm -rf /home/user/dibdab/packages/extension-superscript/
```

### 9. Remove Lists & Blocks

```bash
rm -rf /home/user/dibdab/packages/extension-bullet-list/
rm -rf /home/user/dibdab/packages/extension-ordered-list/
rm -rf /home/user/dibdab/packages/extension-list/
rm -rf /home/user/dibdab/packages/extension-blockquote/
rm -rf /home/user/dibdab/packages/extension-details/
rm -rf /home/user/dibdab/packages/extension-horizontal-rule/
```

### 10. Remove Code Extensions

```bash
rm -rf /home/user/dibdab/packages/extension-code/
rm -rf /home/user/dibdab/packages/extension-code-block/
rm -rf /home/user/dibdab/packages/extension-code-block-lowlight/
```

### 11. Remove Table

```bash
rm -rf /home/user/dibdab/packages/extension-table/
```

### 12. Remove Additional Utils

```bash
rm -rf /home/user/dibdab/packages/extension-highlight/
rm -rf /home/user/dibdab/packages/extension-node-range/
```

### 13. Remove Bundled Packages

```bash
rm -rf /home/user/dibdab/packages/starter-kit/
rm -rf /home/user/dibdab/packages/extension-drag-handle/
```

### 14. Update Workspace

```bash
pnpm install
```

---

## Option C: Complete Single Command

**WARNING:** This will remove all 35 packages at once. Review carefully!

```bash
# From repository root /home/user/dibdab/

# Remove deprecated
rm -rf packages-deprecated/

# Remove all targeted packages
rm -rf packages/extension-youtube/ \
       packages/extension-twitch/ \
       packages/extension-audio/ \
       packages/vue-2/ \
       packages/vue-3/ \
       packages/extension-drag-handle-vue-2/ \
       packages/extension-drag-handle-vue-3/ \
       packages/extension-collaboration/ \
       packages/extension-collaboration-caret/ \
       packages/extension-mathematics/ \
       packages/extension-emoji/ \
       packages/extension-table-of-contents/ \
       packages/extension-mention/ \
       packages/extension-typography/ \
       packages/extension-subscript/ \
       packages/extension-superscript/ \
       packages/extension-invisible-characters/ \
       packages/extension-bullet-list/ \
       packages/extension-ordered-list/ \
       packages/extension-list/ \
       packages/extension-blockquote/ \
       packages/extension-details/ \
       packages/extension-horizontal-rule/ \
       packages/extension-code/ \
       packages/extension-code-block/ \
       packages/extension-code-block-lowlight/ \
       packages/extension-table/ \
       packages/extension-highlight/ \
       packages/extension-node-range/ \
       packages/starter-kit/ \
       packages/extension-drag-handle/

# Update workspace
pnpm install
```

---

## Post-Removal Steps

### 1. Update Root package.json

Check if removed packages are referenced in:
- `/home/user/dibdab/package.json`
- `/home/user/dibdab/pnpm-workspace.yaml`

### 2. Update Documentation

```bash
# Files that might reference removed packages
find . -name "README.md" -o -name "*.md" | grep -v node_modules
```

### 3. Check for Broken Imports

```bash
# Search for imports of removed packages
grep -r "@dibdab/extension-youtube" --include="*.ts" --include="*.tsx" --include="*.js"
grep -r "@dibdab/vue-2" --include="*.ts" --include="*.tsx" --include="*.js"
# ... repeat for other removed packages
```

### 4. Run Tests

```bash
# Run test suite
pnpm test

# Run build
pnpm build
```

### 5. Commit Changes

```bash
git add .
git commit -m "chore: spring clean - remove unused packages

Removed 35 packages to focus on React-based canvas editing:
- All deprecated packages (13)
- Vue.js support (4)
- Social media embeds (3)
- Advanced features (15)

See SPRING_CLEAN_PLAN.md for full details.

https://claude.ai/code/session_013uhcVMJJLm3K4oSH3Sdq3M"
```

---

## Reverting Changes

If you need to undo the removal:

```bash
# If not yet committed
git checkout .
git clean -fd

# If committed
git revert HEAD

# Or restore from backup branch
git checkout backup/pre-spring-clean
```

---

## Verification Checklist

After removal, verify:

- [ ] `pnpm install` completes without errors
- [ ] `pnpm build` completes successfully
- [ ] `pnpm test` passes
- [ ] No broken imports in remaining packages
- [ ] Documentation updated
- [ ] Example apps still work
- [ ] React package functionality intact

---

## Package Count Verification

```bash
# Before removal: 61 total (48 active + 13 deprecated)
# Count current packages:
find packages/ -maxdepth 1 -type d | wc -l
find packages-deprecated/ -maxdepth 1 -type d 2>/dev/null | wc -l

# After minimal removal: ~40 packages
# After full removal: ~26 packages
```

---

## Notes

- Always test in a branch first
- Consider removing in phases (Option A → Option B)
- Keep Git history so packages can be restored if needed
- Update your canvas application to remove references to deleted extensions
- Some packages might have README files or demos - update those too

---

## Questions to Answer First

1. **Are these packages published to npm?**
   - Check if there are external consumers
   - Consider deprecation notices if public

2. **Do you need any of these features?**
   - Lists (bullet/numbered)
   - Tables
   - Code blocks
   - Vue.js support

3. **Testing coverage?**
   - Run full test suite before removal
   - Verify what tests might break

---

## Recommendation

Start with **Option A (Minimal Removal)** to:
1. Remove obvious unused packages (deprecated, social embeds, Vue 2)
2. Test the impact
3. Evaluate if further cleanup is needed
4. Then proceed to Option B if desired

This phased approach is safer and allows you to catch issues early.
