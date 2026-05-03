# Nexorix

<p align="center">
  <strong>Structure, optimize and scale your backend.</strong><br/>
  Modern CLI for backend generation, standardization and analysis.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/nexorix"><img src="https://img.shields.io/npm/v/nexorix.svg" alt="npm version"/></a>
  <a href="https://www.npmjs.com/package/nexorix"><img src="https://img.shields.io/npm/dm/nexorix.svg" alt="downloads"/></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/node/v/nexorix.svg" alt="node version"/></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/nexorix.svg" alt="license"/></a>
  <a href="https://github.com/Nexorix-Group/nexorix"><img src="https://img.shields.io/github/stars/Nexorix-Group/nexorix?style=flat" alt="github stars"/></a>
</p>

---

## Install

```bash
npm install -g nexorix
```

---

## Quick Start

```bash
nexorix init my-api          # Interactive setup
nexorix init my-api --yes    # Skip prompts, instant project
nexorix init --preset saas   # SaaS-ready preset
nexorix init --smart         # Auto-configure everything
```

---

## Commands

| Command | Description |
|---------|-------------|
| `nexorix init [name]` | Create a new backend project |
| `nexorix run` | Start the project server |
| `nexorix generate <type> <name>` | Generate module or route |
| `nexorix add <plugin>` | Install a plugin |
| `nexorix analyze [--pro]` | Analyze project quality and score |
| `nexorix doctor` | Check project health and environment |
| `nexorix version` | Show version |
| `nexorix help` | Show full help menu |

---

## `nexorix init`

Creates a complete backend project with professional architecture.

```bash
nexorix init                          # Interactive mode
nexorix init my-api --mysql --auth    # With flags
nexorix init --preset saas            # Preset mode
nexorix init --smart                  # Auto-configure
nexorix init my-api --yes             # Skip all prompts
nexorix init my-api --typescript      # TypeScript project
```

### Flags

| Flag | Description |
|------|-------------|
| `--mysql` | Use MySQL database |
| `--sqlite` | Use SQLite database |
| `--auth` | Include JWT authentication |
| `--cache` | Include in-memory cache layer |
| `--typescript` | Use TypeScript |
| `--docker` | Generate Dockerfile + docker-compose.yml |
| `--preset <type>` | Preset: `api`, `saas`, `micro`, `docker` |
| `--yes` | Skip prompts, use defaults |
| `--smart` | Auto-select best configuration |

### Presets

| Preset | Includes |
|--------|----------|
| `api` | Clean REST API structure |
| `saas` | Auth + MySQL + Cache, scalable base |
| `micro` | Lightweight and modular |
| `docker` | Auth + MySQL + Cache + Dockerfile + docker-compose.yml |

---

## `nexorix generate`

```bash
nexorix generate module user       # controller + service + repository
nexorix generate route product     # simple route file
nexorix g module order             # alias: g
```

Generated module structure:

```
src/modules/user/
├── user.controller.js   # HTTP handlers
├── user.service.js      # Business logic
└── user.repository.js   # Data access layer
```

---

## `nexorix add`

Install plugins into your existing Nexorix project:

```bash
nexorix add auth      # JWT authentication middleware
nexorix add mysql     # MySQL connection pool (requires mysql2)
nexorix add cache     # In-memory cache with TTL
nexorix add logger    # Structured logging (replaces console.log)
```

---

## `nexorix analyze`

Analyzes your project and returns a quality score (0–100).

```bash
nexorix analyze         # Basic analysis
nexorix analyze --pro   # Deep analysis with full details
```

**Example output:**

```
🔎 Nexorix analisando projeto...

Score: 82/100

⚠ Problemas:
  - controller muito grande
  - uso de console.log

💡 Sugestões:
  - mover lógica para service
  - usar logger estruturado
```

Detects:
- `console.log` usage
- Files over 300 lines
- Controllers with excessive logic
- Missing service layer
- Missing project structure

---

## `nexorix doctor`

```bash
nexorix doctor
```

Checks:
- Node.js version (requires v18+)
- npm availability
- `package.json` presence
- `src/` directory structure
- `node_modules` installed

---

## Generated Project Structure

```
my-project/
├── src/
│   ├── app/
│   │   ├── server.js              # HTTP server factory (native http)
│   │   └── routes.js              # Route definitions + dynamic params
│   ├── modules/
│   │   └── example/
│   │       ├── example.controller.js
│   │       ├── example.service.js
│   │       └── example.repository.js
│   ├── core/
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── error.middleware.js
│   │   ├── database/
│   │   │   └── connection.js
│   │   ├── plugins/               # Installed plugins land here
│   │   └── utils/
│   │       └── helpers.js
│   ├── config/
│   │   └── env.js                 # Environment config (no dotenv dep)
│   └── main.js                    # Entry point
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

The generated server uses **Node.js native `http`** — no Express, no framework overhead.

---

## Plugins

### auth
JWT-compatible authentication middleware. Validates `Authorization: Bearer <token>` headers.

### mysql
MySQL connection pool using `mysql2/promise`. Includes `query()` and `transaction()` helpers.
> Requires: `npm install mysql2`

### cache
In-memory cache with TTL support. Zero dependencies.

```js
cache.set('key', value, 60);   // expires in 60s
cache.get('key');
cache.getOrSet('key', fn, 60); // fetch or compute
```

### logger
Structured JSON logging that replaces `console.log`. Supports `debug`, `info`, `warn`, `error` levels and colorized output.

```js
logger.info('Server started', { port: 3000 });
logger.error('DB failed', { err: error.message });
```

---

## Examples

```bash
# Create a full SaaS backend
nexorix init my-saas --preset saas

# Create a Docker-ready backend
nexorix init my-api --preset docker

# Create a TypeScript API with Docker
nexorix init my-api --typescript --docker --mysql --yes

# Create a TypeScript API
nexorix init my-api --typescript --mysql --auth

# Create a microservice
nexorix init payment-service --preset micro

# Add modules to existing project
nexorix generate module product
nexorix generate module order
nexorix generate route webhook

# Add plugins
nexorix add logger
nexorix add cache

# Check quality
nexorix analyze --pro

# Verify environment
nexorix doctor
```

---

## Requirements

- Node.js >= 18.0.0
- npm >= 8.0.0

---

## License

MIT © [Nexorix Group](https://github.com/Nexorix-Group)
