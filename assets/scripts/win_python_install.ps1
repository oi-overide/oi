# Define the URL to download Python installer
$pythonInstallerUrl = "https://www.python.org/ftp/python/3.11.5/python-3.11.5-amd64.exe"

# Define the path where the installer will be downloaded
$installerPath = "$env:TEMP\python-installer.exe"

# Download the Python installer
Write-Host "Downloading Python installer..."
Invoke-WebRequest -Uri $pythonInstallerUrl -OutFile $installerPath -UseBasicParsing

# Run the Python installer silently with `pip` installation and PATH addition
Write-Host "Installing Python..."
Start-Process -FilePath $installerPath -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1 Include_pip=1" -NoNewWindow -Wait

# Remove the installer after installation
Remove-Item $installerPath -Force

# Verify the installation
Write-Host "Verifying Python installation..."
python --version
pip --version

# Inform the user of completion
Write-Host "Python and pip have been installed successfully."