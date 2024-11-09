#!/bin/bash

# Function to check if Python is already installed
check_python_installed() {
    if command -v python3 &>/dev/null; then
        echo "Python is already installed: $(python3 --version)"
        return 0
    else
        return 1
    fi
}

# Install Python on Linux or macOS
install_python() {
    echo "Installing Python..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # For Linux
        if command -v apt-get &>/dev/null; then
            sudo apt-get update
            sudo apt-get install -y python3 python3-pip
        elif command -v yum &>/dev/null; then
            sudo yum install -y python3 python3-pip
        else
            echo "Unsupported Linux distribution. Please install Python manually."
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # For macOS
        if ! command -v brew &>/dev/null; then
            echo "Homebrew not found. Installing Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        echo "Installing Python with Homebrew..."
        brew install python3
    else
        echo "Unsupported operating system: $OSTYPE"
        exit 1
    fi
}

# Main script execution
if check_python_installed; then
    echo "Python installation skipped."
else
    install_python
    echo "Python and pip installation completed."
fi

# Verify the installation
echo "Verifying Python and pip installation..."
python3 --version
pip3 --version

echo "Installation script finished."
