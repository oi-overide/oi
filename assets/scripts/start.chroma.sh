#!/bin/bash

echo "Starting chromadb local server in docker"
# Open Docker Desktop (this starts the dockerd daemon)
open -a Docker
sleep 5
# Start the container.
docker run -d -p 8000:8000 chromadb/chroma
echo "chromadb running at localhost:8000"

exit 0;
