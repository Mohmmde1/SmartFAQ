FROM node:18-alpine AS frontend-build

# Create a non-root user for the container
ARG USER=mohammed
ARG UID=1001
ARG GID=1001

# Use adduser to create a user with a unique UID and GID
RUN addgroup -g ${GID} ${USER} && \
    adduser -D -u ${UID} -G ${USER} -s /bin/sh ${USER}

# Set working directory for frontend
WORKDIR /app

# Copy entrypoint script
COPY entrypoint.sh entrypoint.sh
RUN chmod +x entrypoint.sh

# Copy project files and change ownership
COPY . .
RUN chown -R ${USER}:${USER} /app

# Switch to non-root user
USER ${USER}

# Expose port 3000 for Next.js
EXPOSE 3000

# Start the Next.js app
ENTRYPOINT [ "./entrypoint.sh" ]
