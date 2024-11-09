# Function to handle errors
function CatchError {
    param([int]$LineNumber)
    Write-Host "Error occurred at line $LineNumber. Exiting..."
    exit 1
}

# Set up an error trap (catch any errors and call CatchError function)
$ErrorActionPreference = "Stop"

Write-Host "Starting Docker setup script..."

# Step 1: Check if dockerd (Docker daemon) is installed
if (-not (Get-Command dockerd -ErrorAction SilentlyContinue)) {
    Write-Host "dockerd (Docker daemon) is not installed. Installing Docker..."

    # Check if Chocolatey is installed (used to install Docker)
    if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
        Write-Host "Chocolatey not found, installing Chocolatey..."
        # Install Chocolatey
        Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12; Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    }

    # Install Docker Desktop via Chocolatey
    Write-Host "Installing Docker Desktop via Chocolatey..."
    choco install docker-desktop -y

    # Open Docker Desktop (this starts the dockerd daemon)
    Write-Host "Opening Docker Desktop..."
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

    Write-Host "Waiting for Docker to initialize..."

    # Wait for Docker to initialize (60 seconds)
    $maxRetries = 30
    $retryInterval = 2
    $retryCount = 0

    while (-not (docker info -ErrorAction SilentlyContinue)) {
        $retryCount++
        if ($retryCount -ge $maxRetries) {
            Write-Host "Docker did not initialize in time. Please check Docker Desktop."
            exit 1
        }
        Write-Host "Docker is not ready yet, retrying in $retryInterval seconds..."
        Start-Sleep -Seconds $retryInterval
    }

    Write-Host "Docker is now running. Please follow the setup in Docker Desktop if needed."
} else {
    Write-Host "dockerd (Docker daemon) is already installed."
}

# Step 2: Check if Docker CLI (docker) is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Docker CLI is not installed. Please install Docker first."
    exit 1
} else {
    Write-Host "Docker CLI is already installed."
}

# Step 3: Wait for Docker to fully initialize and for the user to sign in (if required)
Write-Host "Waiting for Docker to fully initialize and for you to sign in (if required)..."
Start-Sleep -Seconds 60  # Increased wait time to 60 seconds

# Step 4: Pull the Docker image (Chromadb)
Write-Host "Pulling Chromadb Docker image..."
docker pull chromadb/chroma

# Step 5: Run the Docker container in detached mode
Write-Host "Starting Chromadb container on port 8000..."
docker run -d -p 8000:8000 chromadb/chroma

Write-Host "Chromadb container is now running in the background on port 8000."

exit 0
