# Docker Deployment Guide

This guide explains how to run the DNA web application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, but recommended)

## Quick Start

### Using Docker Compose (Recommended)

1. Build and start the container:
```bash
docker-compose up -d
```

2. View logs:
```bash
docker-compose logs -f
```

3. Stop the container:
```bash
docker-compose down
```

### Using Docker CLI

1. Build the image:
```bash
docker build -t dna-app .
```

2. Run the container:
```bash
docker run -d \
  --name dna-app \
  -p 3016:3016 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/logs:/app/logs \
  -e NODE_ENV=production \
  -e PORT=3016 \
  dna-app
```

3. View logs:
```bash
docker logs -f dna-app
```

4. Stop and remove the container:
```bash
docker stop dna-app
docker rm dna-app
```

## Configuration

### Environment Variables

Edit the `docker-compose.yml` file to configure environment variables:

```yaml
environment:
  - NODE_ENV=production
  - PORT=3016
  - NEXT_TELEMETRY_DISABLED=1
  # Add your custom variables here
```

### Data Persistence

The following directories are persisted using Docker volumes:
- `/app/data` - LMDB database and uploads
- `/app/logs` - Application logs

## Health Check

The container includes a health check that monitors the application status:
- Endpoint: `http://localhost:3016/api/health`
- Interval: 30 seconds
- Timeout: 10 seconds
- Retries: 3

Check container health:
```bash
docker ps
# or
docker inspect --format='{{.State.Health.Status}}' dna-app
```

## Updating

To update the application:

1. Stop the current container:
```bash
docker-compose down
```

2. Rebuild the image:
```bash
docker-compose build --no-cache
```

3. Start the new container:
```bash
docker-compose up -d
```

## Troubleshooting

### View container logs
```bash
docker-compose logs -f dna-app
```

### Access container shell
```bash
docker exec -it dna-app sh
```

### Check container status
```bash
docker ps -a
```

### Remove all containers and images
```bash
docker-compose down --rmi all --volumes
```

## Production Considerations

1. **Security**: 
   - Change default ports if needed
   - Set strong environment variables
   - Use secrets management for sensitive data

2. **Performance**:
   - Adjust container resources (CPU, memory) as needed
   - Monitor container metrics

3. **Backup**:
   - Regularly backup the `data` directory
   - Consider automated backup solutions

4. **Monitoring**:
   - Implement logging aggregation
   - Set up monitoring and alerting

## Lite Version

For resource-constrained environments, use the lite Dockerfile:
```bash
docker build -f Dockerfile.lite -t dna-app:lite .
```

This version is optimized for lower resource usage.
