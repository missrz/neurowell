FROM node:18-alpine
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
# Retry npm ci up to 5 times to mitigate transient registry errors, then fall back to npm install without dev deps
RUN set -eux; \
	attempt=0; \
	until [ "$attempt" -ge 5 ]; do \
		attempt=$((attempt+1)); \
		echo "Trying npm ci (attempt $attempt)"; \
		if npm ci --only=production; then \
			echo "npm ci succeeded"; \
			break; \
		else \
			echo "npm ci failed, retrying in 5s..."; \
			sleep 5; \
		fi; \
	done; \
	if [ "$attempt" -ge 5 ]; then \
		echo "npm ci failed after retries, falling back to npm install --omit=dev"; \
		npm install --omit=dev --no-audit --no-fund; \
	fi
COPY . .
ENV PORT=5000
EXPOSE 5000
CMD ["node", "server.js"]
