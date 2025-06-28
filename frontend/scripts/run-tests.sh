#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if dependencies are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install Node.js and npm."
        exit 1
    fi
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Are you in the correct directory?"
        exit 1
    fi
    
    if [ ! -d "node_modules" ]; then
        print_warning "node_modules not found. Installing dependencies..."
        npm install
    fi
    
    print_success "Dependencies check completed."
}

# Function to run all tests
run_all_tests() {
    print_status "Running all tests..."
    npm test -- --watchAll=false
    
    if [ $? -eq 0 ]; then
        print_success "All tests passed!"
    else
        print_error "Some tests failed!"
        exit 1
    fi
}

# Function to run tests with coverage
run_coverage() {
    print_status "Running tests with coverage..."
    npm test -- --coverage --watchAll=false
    
    if [ $? -eq 0 ]; then
        print_success "Tests completed with coverage report!"
        print_status "Coverage report available in coverage/ directory"
    else
        print_error "Some tests failed!"
        exit 1
    fi
}

# Function to run tests in watch mode
run_watch() {
    print_status "Running tests in watch mode..."
    print_warning "Press 'q' to quit watch mode"
    npm test
}

# Function to run unit tests only
run_unit_tests() {
    print_status "Running unit tests..."
    npm test -- --testPathPattern="components" --watchAll=false
    
    if [ $? -eq 0 ]; then
        print_success "Unit tests passed!"
    else
        print_error "Some unit tests failed!"
        exit 1
    fi
}

# Function to run integration tests only
run_integration_tests() {
    print_status "Running integration tests..."
    npm test -- --testPathPattern="integration" --watchAll=false
    
    if [ $? -eq 0 ]; then
        print_success "Integration tests passed!"
    else
        print_error "Some integration tests failed!"
        exit 1
    fi
}

# Function to run specific test file
run_specific_test() {
    local test_file=$1
    print_status "Running specific test: $test_file"
    npm test -- --testPathPattern="$test_file" --watchAll=false
    
    if [ $? -eq 0 ]; then
        print_success "Test $test_file passed!"
    else
        print_error "Test $test_file failed!"
        exit 1
    fi
}

# Function to clean test cache
clean_cache() {
    print_status "Cleaning Jest cache..."
    npm test -- --clearCache
    print_success "Cache cleaned!"
}

# Function to show help
show_help() {
    echo "Test Runner Script for Task Management System"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  all                 Run all tests"
    echo "  unit               Run unit tests only"
    echo "  integration        Run integration tests only"
    echo "  coverage           Run tests with coverage report"
    echo "  watch              Run tests in watch mode"
    echo "  clean              Clean Jest cache"
    echo "  help               Show this help message"
    echo ""
    echo "Options:"
    echo "  --file <filename>  Run specific test file"
    echo ""
    echo "Examples:"
    echo "  $0 all"
    echo "  $0 coverage"
    echo "  $0 --file login-form.test.tsx"
    echo "  $0 unit"
    echo ""
}

# Main script logic
main() {
    # Check dependencies first
    check_dependencies
    
    # Parse command line arguments
    case "$1" in
        "all")
            run_all_tests
            ;;
        "unit")
            run_unit_tests
            ;;
        "integration")
            run_integration_tests
            ;;
        "coverage")
            run_coverage
            ;;
        "watch")
            run_watch
            ;;
        "clean")
            clean_cache
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        "--file")
            if [ -z "$2" ]; then
                print_error "Please specify a test file name"
                exit 1
            fi
            run_specific_test "$2"
            ;;
        "")
            print_warning "No command specified. Running all tests..."
            run_all_tests
            ;;
        *)
            print_error "Unknown command: $1"
            print_status "Use '$0 help' to see available commands"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
