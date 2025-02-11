# DevEnvBootstrap

A CLI tool that automates the setup of development environments for Node.js projects, with a focus on Express.js applications.

> ⚠️ **Note**: This project is currently in initial release phase and undergoing testing.

## Features

- 🔍 Project structure analysis
- 🐳 Docker configuration generation
- 🛠️ Environment setup automation
- 📦 Service dependency detection
- ⚙️ Customizable configurations
- 🚀 Support for TypeScript projects

## Installation

```bash
npm install -g dev-env-bootstrap
```

## Quick Start

1. Navigate to your Express.js project:
```bash
cd your-project
```

2. Run the analysis:
```bash
deb analyze
```

3. Generate Docker configuration:
```bash
deb express generate -i
```

## Basic Usage

### Project Analysis

```bash
# Basic analysis
deb analyze

# Detailed JSON output
deb analyze --json
```

### Docker Configuration Generation

```bash
# Interactive mode
deb express generate -i

# Development mode
deb express generate --dev

# Production mode
deb express generate --prod
```

## Development

### Prerequisites

- Node.js >= 16.0.0
- npm >= 7.0.0
- Docker & Docker Compose
- Git

### Setup

1. Clone the repository:
```bash
git clone https://github.com/LearningNoob00000/dev-env-bootstrap.git
cd dev-env-bootstrap
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

## Documentation

See the [docs](docs/) directory for detailed documentation.

## License

This project is licensed under the MIT License.

## Contributing

We welcome contributions! Please create an issue or pull request in the GitHub repository.

## Support

- Create an issue in the [GitHub repository](https://github.com/LearningNoob00000/dev-env-bootstrap/issues)
- Check [documentation](docs/) for guides and references
