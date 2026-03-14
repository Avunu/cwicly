# Cwicly Rebuild

Maintenance version of the Cwicly WordPress plugin, rebuilt using modern tools to ensure long-term compatibility with upcoming React and Gutenberg updates.

## Technical Goals

- **Modern Build Stack**: Migrated to `@wordpress/scripts` for standardized building and dependency management.
- **React 19 Compatibility**: Configured to externalize React and WordPress packages, preventing version conflicts when WordPress updates its core libraries.
- **Dynamic Asset Loading**: Implements a robust `index.asset.php` system in the `build/` directory to ensure all dependencies are correctly enqueued in the editor and frontend.

## Prerequisites

- **PHP**: 7.4 or higher
- **Node.js**: 18.x or 20.x (Recommended)
- **Composer**: For PHP dependency management

## Setup & Installation

1. **Clone the repository** into your WordPress plugins directory:
   ```bash
   git clone https://github.com/StrangeTechDev/cwicly.git
   ```

2. **Install JavaScript dependencies**:
   ```bash
   npm install
   ```

3. **Install PHP dependencies**:
   ```bash
   composer install
   ```

## Development Workflow

### Build Scripts

- `npm start`: Starts the development build in watch mode. Useful for local development and real-time updates.
- `npm run build`: Generates the production-ready build in the `build/` directory.

### Asset Management

The build process auto-generates `build/index.asset.php`. This file contains the exact dependency list and a unique version hash.

- **Manual Override**: If you need to manually force dependencies or a specific version (e.g., for major version bumps), you can edit the tracked version in `build/index.asset.php`.
- **Plugin Integration**: `cwicly.php` is configured to dynamically read this asset file. If the file is missing, it falls back to a safe set of core WordPress dependencies.

## Known Issues

1. **Cwicly Paragraph**: Editor toolbar may not appear when the block is selected (top toolbar remains functional).
2. **Compatibility**: Tested up to WordPress 6.6.2 and Gutenberg 19.x.

## License

ISC License. See `LICENSE` for details.
