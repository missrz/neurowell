FROM python:3.10-slim
WORKDIR /app

# Install curl for healthchecks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY ai_server.py requirements.txt* ./
RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 4001
CMD ["python3", "ai_server.py"]
