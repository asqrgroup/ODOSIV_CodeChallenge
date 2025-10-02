# Minimal Dockerfile - no requirements.txt
FROM python:3.11-slim

# Set work directory inside container
WORKDIR /app

# Copy everything from repo into container
COPY . .

# Run a simple command so the container stays up
CMD ["python3", "-m", "http.server", "80"]
