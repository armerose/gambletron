# Documentation Structure

This document explains the new documentation organization for Gambletron.

## Philosophy

- **README.md** is the single entry point - comprehensive but concise
- **docs/** contains all detailed documentation organized by topic
- **docs/archive/** contains historical and reference documents
- **docs/UI/** contains web dashboard documentation

## Root Directory

The root now contains only:
- **README.md** - Project overview and quick start (main entry point)
- Source code, config, and executable files
- No other documentation files

## Documentation Structure

```
docs/
├── index.md                          # Documentation home & navigation
├── GETTING_STARTED.md               # Installation and setup guide
├── ARCHITECTURE.md                  # System design and architecture
├── CONFIGURATION.md                 # Configuration reference
├── STRATEGIES.md                    # Trading strategies guide
├── PRODUCTION_GUIDE.md              # Deployment and production setup
├── TROUBLESHOOTING.md               # Common issues and solutions
├── FAQ.md                           # Frequently asked questions
├── API_REFERENCE.md                 # Code API documentation
├── ROADMAP.md                       # Development roadmap
│
├── UI/                              # Web Dashboard Documentation
│   ├── README.md                    # UI overview
│   ├── FEATURES.md                  # Feature reference
│   ├── INTEGRATION.md               # Integration guide
│   ├── COMPLETE.md                  # Feature completion report
│   └── SUMMARY.md                   # Implementation summary
│
└── archive/                         # Historical & Reference Docs
    ├── PROJECT_SUMMARY.md           # Project completion summary
    ├── SESSION_COMPLETION.md        # Session completion log
    ├── SESSION_SUMMARY.md           # Session summary
    ├── CODE_CHANGES.md              # Code changes summary
    ├── ERROR_ANALYSIS.md            # Error analysis report
    ├── ERRORS_FIXED_REPORT.md       # Errors fixed report
    ├── FILE_MANIFEST.md             # File manifest
    ├── DOCUMENTATION_INDEX.md       # Old documentation index
    ├── INDEX.md                     # Old documentation index
    └── STATUS_DASHBOARD.txt         # Status dashboard
```

## Navigation Guide

### For Different Audiences

| I want to... | Read this |
|-------------|-----------|
| Understand what Gambletron is | [README.md](README.md) |
| Get started quickly | [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) |
| Understand the system architecture | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Configure trading parameters | [docs/CONFIGURATION.md](docs/CONFIGURATION.md) |
| Learn about trading strategies | [docs/STRATEGIES.md](docs/STRATEGIES.md) |
| Deploy to production | [docs/PRODUCTION_GUIDE.md](docs/PRODUCTION_GUIDE.md) |
| Troubleshoot issues | [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) |
| Find answers to common questions | [docs/FAQ.md](docs/FAQ.md) |
| Use the web dashboard | [docs/UI/README.md](docs/UI/README.md) |
| See what the UI can do | [docs/UI/FEATURES.md](docs/UI/FEATURES.md) |

### For Developers

- **API Documentation**: [docs/API_REFERENCE.md](docs/API_REFERENCE.md)
- **Architecture Details**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Configuration Details**: [docs/CONFIGURATION.md](docs/CONFIGURATION.md)

## Key Changes

### Removed from Root
- ARCHITECTURE.md → docs/ARCHITECTURE.md
- GETTING_STARTED.md → docs/GETTING_STARTED.md
- PRODUCTION_GUIDE.md → docs/PRODUCTION_GUIDE.md
- ROADMAP.md → docs/ROADMAP.md
- All UI documentation → docs/UI/
- All session/error/archive documentation → docs/archive/
- README_NEW.md (duplicate, removed)

### Consolidated into README.md
- Quick start instructions
- Feature overview
- Technology stack
- Key links to detailed documentation

### New or Reorganized
- docs/index.md - Documentation home page
- docs/UI/ directory - All UI documentation
- docs/archive/ directory - All historical documentation

## How to Update Documentation

1. **Core documentation** goes in `docs/` directory
2. **UI-specific docs** go in `docs/UI/` directory
3. **Historical/archive content** goes in `docs/archive/`
4. **Update links** in README.md when adding new major documentation

## Accessing Documentation

All documentation is linked from:
1. **[README.md](README.md)** - Start here for overview
2. **[docs/index.md](docs/index.md)** - Full documentation index
3. Each document links to related documents
