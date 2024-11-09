#!/bin/bash

# Function to handle errors
catch() {
    echo "Error occurred at line $1. Exiting..."
    exit 1
}

# Set up a trap for catching any unexpected errors
trap 'catch $LINENO' ERR

echo "Starting Docker setup script..."

# Step 1: Check if dockerd (Docker daemon) is installed
if ! command -v dockerd &> /dev/null
then
    echo "dockerd (Docker daemon) is not installed. Installing Docker..."
    
    # Install Homebrew if not installed (used to install Docker)
    if ! command -v brew &> /dev/null
    then
        echo "Homebrew not found, installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi

    # Install Docker (dockerd and Docker CLI)
    echo "Installing Docker via Homebrew..."
    brew install --cask docker
    
    # Open Docker Desktop (this starts the dockerd daemon)
    open -a Docker

    echo "Waiting for Docker to initialize..."
    sleep 2

    echo "Waiting for Docker to fully initialize and for you to sign in (if required)... 60 secs"
    sleep 60  # Increased wait time to 60 seconds

else
    echo "dockerd (Docker daemon) is already installed."
fi

# Step 2: Check if Docker CLI (docker) is installed
if ! command -v docker &> /dev/null
then
    echo "Docker CLI is not installed. Please install Docker first."
    exit 1
else
    echo "Docker CLI is already installed."
fi

# Step 3: Pull the Docker image (Chromadb)
echo "Pulling Chromadb Docker image..."
docker pull chromadb/chroma

# Step 4: Run the Docker container
echo "Starting Chromadb container on port 8000..."
docker run -d -p 8000:8000 chromadb/chroma

exit 0
