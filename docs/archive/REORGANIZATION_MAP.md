# Documentation Reorganization Map

This document maps all the files moved during the documentation reorganization.

## Migration Summary

**Date**: February 1, 2026

### Moved to `docs/` (Core Documentation)

| Original Location | New Location | Purpose |
|------------------|--------------|---------|
| `ARCHITECTURE.md` | `docs/ARCHITECTURE.md` | System architecture and design |
| `GETTING_STARTED.md` | `docs/GETTING_STARTED.md` | Installation and setup guide |
| `PRODUCTION_GUIDE.md` | `docs/PRODUCTION_GUIDE.md` | Production deployment |
| `ROADMAP.md` | `docs/ROADMAP.md` | Development roadmap |

### Organized in `docs/UI/` (Dashboard Documentation)

| Original Location | New Location | Purpose |
|------------------|--------------|---------|
| `UI_README.md` | `docs/UI/README.md` | UI overview |
| `UI_FEATURES.md` | `docs/UI/FEATURES.md` | Feature reference |
| `UI_INTEGRATION.md` | `docs/UI/INTEGRATION.md` | Integration guide |
| `UI_COMPLETE.md` | `docs/UI/COMPLETE.md` | Completion report |
| `UI_SUMMARY.md` | `docs/UI/SUMMARY.md` | Implementation summary |

### Archived in `docs/archive/` (Historical & Reference)

| Original Location | New Location | Purpose |
|------------------|--------------|---------|
| `CODE_CHANGES.md` | `docs/archive/CODE_CHANGES.md` | Code changes made |
| `ERROR_ANALYSIS.md` | `docs/archive/ERROR_ANALYSIS.md` | Error analysis |
| `ERRORS_FIXED_REPORT.md` | `docs/archive/ERRORS_FIXED_REPORT.md` | Errors fixed report |
| `FILE_MANIFEST.md` | `docs/archive/FILE_MANIFEST.md` | File manifest |
| `PROJECT_SUMMARY.md` | `docs/archive/PROJECT_SUMMARY.md` | Project completion summary |
| `SESSION_COMPLETION.md` | `docs/archive/SESSION_COMPLETION.md` | Session completion log |
| `SESSION_SUMMARY.md` | `docs/archive/SESSION_SUMMARY.md` | Session summary |
| `DOCUMENTATION_INDEX.md` | `docs/archive/DOCUMENTATION_INDEX.md` | Old doc index |
| `INDEX.md` | `docs/archive/INDEX.md` | Old doc index |
| `STATUS_DASHBOARD.txt` | `docs/archive/STATUS_DASHBOARD.txt` | Status snapshot |

### Removed (Duplicates)

| File | Reason |
|------|--------|
| `README_NEW.md` | Duplicate of README.md |

### Enhanced (Root)

| File | Changes |
|------|---------|
| `README.md` | Consolidated all documentation links, improved navigation, added feature overview, integrated quick start |

## Files Remaining in Root

- `README.md` - **Main documentation entry point**
- `quickstart.py` - Quick start demo script
- `run_backtest.py` - Backtest runner
- `test_agent_trading.py` - Test suite
- `validate_system.py` - System validation script

## Cross-References

All documentation files have been updated to link to their new locations:
- Internal `docs/` links work correctly
- README.md links all point to `docs/` directory
- No broken links

## Access Points

Users can access documentation from:

1. **README.md** (root) - Main entry point
2. **docs/index.md** - Documentation index
3. **docs/UI/README.md** - UI documentation
4. **docs/archive/** - Historical references

## Structure Rationale

```
docs/
├── Main docs (GETTING_STARTED, ARCHITECTURE, etc.)  # For active users
├── UI/                                               # Dashboard-specific docs
└── archive/                                          # Historical references
```

This structure ensures:
- Clean root directory (only README.md)
- Easy discovery of essential documentation
- UI documentation properly organized
- Historical docs preserved but not cluttering the main directory
