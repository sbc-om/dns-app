# Docker Configuration

This directory contains the essential Docker files for the DNA application:

## Files Overview

### Core Files
- `Dockerfile` - Production build with optimized Next.js standalone output
- `Dockerfile.dev` - Development build with hot reload and full npm dependencies
- `docker-compose.yml` - Production deployment with nginx proxy and SSL
- `docker-compose.local.yml` - Local development with 2GB memory allocation
- `docker-local.sh` - Management script for local development

### Quick Start

#### Local Development (2GB RAM)
```bash
# Setup, build and start
./docker-local.sh setup

# Just start if already built
./docker-local.sh start

# Stop
./docker-local.sh stop

# View logs
./docker-local.sh logs
```

#### Production Deployment
```bash
# On server with domain
docker-compose up -d
```

## Memory Configuration

- **Local Development**: 2GB container, 1.5GB Node.js heap, 128MB LMDB
- **Production**: 4GB container, 2GB Node.js heap, 256MB LMDB

## Ports

- **Local**: http://localhost:3013
- **Production**: https://dna.sbc.om (via nginx proxy)