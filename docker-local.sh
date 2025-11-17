#!/bin/bash

# Local Docker Start Script for dna Hub
# For local development and testing without domain requirements

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check which docker compose version is available
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    print_error "Neither 'docker compose' nor 'docker-compose' found"
    exit 1
fi

# Create necessary directories
create_directories() {
    print_info "Creating necessary directories..."
    mkdir -p data/lmdb
    mkdir -p data/uploads/images
    mkdir -p data/uploads/documents
    mkdir -p data/uploads/videos
    mkdir -p data/uploads/others
    mkdir -p logs
    print_success "Directories created"
}

# Build application
build() {
    print_info "Building Docker image for local development..."
    $DOCKER_COMPOSE -f docker-compose.local.yml build --no-cache
    print_success "Docker image built"
}

# Start application
start() {
    print_info "Starting dna Hub locally..."
    $DOCKER_COMPOSE -f docker-compose.local.yml up -d
    print_success "dna Hub started"
    print_info "Application is available at: http://localhost:3013"
    print_info "Access the dashboard at: http://localhost:3013/en/dashboard"
}

# Stop application
stop() {
    print_info "Stopping dna Hub..."
    $DOCKER_COMPOSE -f docker-compose.local.yml down
    print_success "dna Hub stopped"
}

# View logs
logs() {
    $DOCKER_COMPOSE -f docker-compose.local.yml logs -f
}

# Initialize database
init() {
    print_info "Initializing database..."
    $DOCKER_COMPOSE -f docker-compose.local.yml exec app npm run db:init
    print_success "Database initialized"
}

# Create admin user
create_admin() {
    print_info "Creating admin user..."
    $DOCKER_COMPOSE -f docker-compose.local.yml exec app npm run create-admin
    print_success "Admin user created"
}

# Show status
status() {
    print_info "=== Local dna Hub Status ==="
    $DOCKER_COMPOSE -f docker-compose.local.yml ps
}

# Full local setup
setup() {
    print_info "Setting up local development environment..."
    echo ""
    
    create_directories
    build
    start
    sleep 5
    init
    create_admin
    
    echo ""
    print_success "✅ Local setup complete!"
    echo ""
    print_info "🌐 Your application is now available at:"
    echo ""
    echo "   http://localhost:3013"
    echo ""
    print_info "👤 Default admin credentials:"
    echo "   Email: admin@dna.com"
    echo "   Password: admin123"
    echo ""
    print_info "📊 Dashboard: http://localhost:3013/en/dashboard"
    echo ""
}

# Show help
show_help() {
    echo ""
    echo "dna Hub - Local Docker Management Script"
    echo ""
    echo "Usage: ./docker-local.sh [command]"
    echo ""
    echo "Commands:"
    echo "  setup      - Full local setup (build + start + init + admin)"
    echo "  build      - Build Docker image"
    echo "  start      - Start application"
    echo "  stop       - Stop application"
    echo "  restart    - Restart application"
    echo "  logs       - View logs"
    echo "  init       - Initialize database"
    echo "  admin      - Create admin user"
    echo "  status     - Show status"
    echo "  help       - Show this help"
    echo ""
    echo "Examples:"
    echo "  ./docker-local.sh setup     # Full setup for first time"
    echo "  ./docker-local.sh start     # Start after setup"
    echo "  ./docker-local.sh logs      # View logs"
    echo ""
    echo "Local Access:"
    echo "  URL: http://localhost:3013"
    echo "  Admin: admin@dna.com / admin123"
    echo ""
}

# Main
case "${1:-}" in
    setup)
        setup
        ;;
    build)
        create_directories
        build
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        stop
        sleep 2
        start
        ;;
    logs)
        logs
        ;;
    init)
        init
        ;;
    admin)
        create_admin
        ;;
    status)
        status
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Invalid command: ${1:-}"
        show_help
        exit 1
        ;;
esac