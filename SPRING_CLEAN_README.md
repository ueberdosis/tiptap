# DibDab Spring Clean - Documentation Index

**Created:** 2026-01-22
**Purpose:** Comprehensive package audit and removal plan for DibDab

---

## Quick Start

**Start Here:** Read the documents in this order:

1. **This file** - Overview and quick stats
2. `SPRING_CLEAN_PLAN.md` - Detailed analysis and justifications
3. `REMOVAL_COMMANDS.md` - Specific commands to execute
4. `PACKAGE_INVENTORY.csv` - Structured data (import into spreadsheet)

---

## Executive Summary

### Current State
- **Total Packages:** 61 (48 active + 13 deprecated)
- **Framework Support:** React, Vue 2, Vue 3, Framework-agnostic
- **Scope:** Full-featured rich text editor with everything from basic text to tables, collaboration, embeds, math

### Proposed State
- **Total Packages:** 26-28 (depending on evaluation decisions)
- **Reduction:** 57% fewer packages
- **Framework Support:** React only (initially)
- **Scope:** Focused canvas text editor with rich formatting

---

## Key Documents

### 📋 SPRING_CLEAN_PLAN.md (17KB, 456 lines)
**Most Important Document**

Comprehensive analysis including:
- Complete package inventory with categorization
- Keep/Remove recommendations with justifications
- Detailed categorization (10 removal categories)
- Alternative minimal removal approach
- Implementation phases
- Risk assessment and mitigation strategies
- Decision checkpoints

**What to Review:**
- Section: "CORE PACKAGES (KEEP)" - packages you must keep
- Section: "Recommended Removal List" - all 35 packages to remove
- Section: "Alternative: Minimal Removal Approach" - conservative option
- Section: "Decision Checkpoints" - questions to answer before proceeding

### 🔧 REMOVAL_COMMANDS.md (7.5KB)
**Execution Guide**

Ready-to-run commands:
- Option A: Minimal Removal (21 packages, low risk)
- Option B: Aggressive Removal (35 packages, medium risk)
- Option C: Single command removal (all at once)
- Post-removal steps (testing, verification)
- Revert instructions if needed

**What to Review:**
- Your preferred removal option (A, B, or C)
- Post-removal checklist
- Verification steps

### 📊 PACKAGE_INVENTORY.csv (6.5KB)
**Structured Data**

All 61 packages with:
- Package name
- Category
- Status (Active/Deprecated)
- Recommendation (KEEP/REMOVE/EVALUATE)
- Justification
- Dependencies
- Priority (CRITICAL/HIGH/MEDIUM/LOW)

**Use Cases:**
- Import into Excel/Google Sheets for tracking
- Share with team for review
- Filter/sort by recommendation or priority
- Track removal progress

---

## Removal Options

### Option A: Minimal (Recommended First)
**Removes:** 21 packages (~34%)
**Risk:** LOW

- All deprecated packages (13)
- Social media embeds (3)
- Vue 2 (2)
- Specialized features (3)

**Benefit:** Safe, clear wins, easy to test

### Option B: Aggressive (Full Clean)
**Removes:** 35 packages (~57%)
**Risk:** MEDIUM

Everything from Option A, plus:
- Vue 3 (2)
- Collaboration (2)
- Advanced features (8)
- Lists & blocks (6)
- Code extensions (3)
- Table (1)
- Additional utils (2)
- Bundled packages (2)

**Benefit:** Maximum reduction, focused scope

---

## Package Categories

### KEEP (26 packages)

**Core (6):** core, pm, react, html, markdown, static-renderer
**Text Formatting (10):** text, paragraph, document, bold, italic, underline, strike, heading, hard-break, text-style
**Useful Extensions (5):** color, font-family, text-align, image, link
**Utilities (5):** extensions, suggestion, bubble-menu, floating-menu, drag-handle-react

### EVALUATE (2 packages)

- `extension-unique-id` - May be needed for canvas node tracking
- `extension-file-handler` - Could be useful for file drag-drop

### REMOVE (35 packages)

See `SPRING_CLEAN_PLAN.md` for complete list with justifications

---

## Next Steps

### Phase 1: Review (Before Any Removal)
- [ ] Read `SPRING_CLEAN_PLAN.md` thoroughly
- [ ] Answer decision checkpoint questions
- [ ] Review packages marked "EVALUATE" for your use case
- [ ] Determine if you need: lists, tables, code blocks, Vue support
- [ ] Check if packages are published to npm (external consumers)
- [ ] Discuss with team if applicable

### Phase 2: Preparation
- [ ] Create backup branch: `git checkout -b backup/pre-spring-clean`
- [ ] Commit current state
- [ ] Create working branch: `git checkout -b dibdab/spring-clean`
- [ ] Review `REMOVAL_COMMANDS.md` for execution plan

### Phase 3: Execute
- [ ] Choose removal option (A, B, or C)
- [ ] Execute removal commands from `REMOVAL_COMMANDS.md`
- [ ] Run `pnpm install`
- [ ] Run `pnpm build`
- [ ] Run `pnpm test`

### Phase 4: Verify
- [ ] Check for broken imports
- [ ] Test example apps
- [ ] Verify React package works
- [ ] Update documentation
- [ ] Commit changes with descriptive message

### Phase 5: Clean Up
- [ ] Update README files
- [ ] Remove references in docs
- [ ] Update build configurations
- [ ] Publish or deprecate removed packages if public

---

## Key Statistics

### Before
| Metric | Count |
|--------|-------|
| Total Packages | 61 |
| Active Packages | 48 |
| Deprecated Packages | 13 |
| Frameworks | 4 (Core, React, Vue 2, Vue 3) |
| Bundle Size | Large (everything included) |

### After (Option B)
| Metric | Count |
|--------|-------|
| Total Packages | 26 |
| Active Packages | 26 |
| Deprecated Packages | 0 |
| Frameworks | 2 (Core, React) |
| Bundle Size | ~57% smaller |

---

## Benefits

### Maintenance
- Fewer packages to update and maintain
- Simpler dependency tree
- Reduced security surface area
- Easier to reason about codebase

### Performance
- Faster build times
- Smaller bundle sizes
- Fewer dependencies to install
- Quicker CI/CD pipelines

### Clarity
- Clear focus on canvas editing
- React-first approach
- Easier for new contributors
- Better documentation scope

---

## Risks & Mitigation

### Risks
1. Users might want removed features back
2. Breaking changes if packages are published
3. Effort to remove vs. maintain
4. Potential to remove something needed later

### Mitigation
1. All packages remain in Git history (can restore)
2. Check npm before removal, add deprecation notices
3. Start with minimal removal (Option A)
4. Keep comprehensive documentation of what was removed
5. Use feature flags for uncertain packages instead of removal

---

## Conservative Approach

If uncertain, start with just removing deprecated packages:

```bash
# Safest first step - only remove deprecated directory
rm -rf /home/user/dibdab/packages-deprecated/
pnpm install
pnpm build
pnpm test
```

This alone gives you:
- 13 fewer packages (~21% reduction)
- Zero risk (already deprecated)
- Cleaner codebase
- Easy win

Then evaluate if you want to proceed further.

---

## Important Notes

### Before Removing Lists/Tables
Many canvas applications DO use:
- Bullet lists
- Numbered lists
- Tables (for structured data)

**Recommendation:** Keep these if your canvas tool needs structured content.
Remove the list/table categories from the removal plan if needed.

### Before Removing Code Extensions
If you're building a tool that needs to display code snippets:
- Keep `extension-code`
- Keep `extension-code-block`
- Consider keeping `extension-code-block-lowlight` for syntax highlighting

### Vue.js Support
- Vue 2 is end-of-life (safe to remove)
- Vue 3 removal is reversible if Vue users emerge
- All Vue packages can be restored from Git history

---

## Questions?

Review these sections in `SPRING_CLEAN_PLAN.md`:
- "Decision Checkpoints" - questions to answer
- "Alternative: Minimal Removal Approach" - conservative option
- "Notes" - additional considerations
- "Implementation Plan" - step-by-step phases

---

## File Locations

All analysis files are in the repository root:

```
/home/user/dibdab/
├── SPRING_CLEAN_README.md (this file)
├── SPRING_CLEAN_PLAN.md (detailed analysis)
├── REMOVAL_COMMANDS.md (execution guide)
└── PACKAGE_INVENTORY.csv (structured data)
```

---

## Recommendation

**For most cases:** Start with **Option A (Minimal Removal)**

This removes obvious unused packages with very low risk:
- Deprecated packages (already deprecated)
- Social media embeds (clearly not needed)
- Vue 2 (end-of-life framework)
- Specialized features (math, emoji, invisible chars)

**Result:** 34% reduction, low risk, easy to test

If successful and you want more cleanup, then proceed to Option B.

---

## Success Criteria

After removal, you should have:
- ✅ Cleaner, more focused package structure
- ✅ All builds passing
- ✅ All tests passing
- ✅ React integration working
- ✅ Smaller bundle sizes
- ✅ Faster build times
- ✅ Clear documentation of changes

---

## Support

If you need to restore removed packages:
- They remain in Git history
- Can cherry-pick from backup branch
- Can restore individual packages as needed

**Remember:** Nothing is permanently lost - everything is in version control!

---

**Good luck with the spring clean!** 🧹
