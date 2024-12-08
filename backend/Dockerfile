FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Create a non-root user for the container
ARG USER=mohammed
ARG UID=1000
ARG GID=1000

RUN groupadd -g ${GID} ${USER} && \
    useradd -m -u ${UID} -g ${GID} -s /bin/bash ${USER}

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory and ensure permissions
WORKDIR /app
RUN chown -R ${USER}:${USER} /app

# Install Poetry
RUN pip install poetry==1.8.2

# Copy project files
COPY --chown=${USER}:${USER} . .


# Ensure entrypoint script is executable
RUN chmod +x entrypoint.sh


# Configure Poetry
RUN poetry config virtualenvs.create false

# Install dependencies without cache for smaller image layers
RUN poetry install --only main --no-interaction --no-ansi

# Expose application port
EXPOSE 8000

# Switch to non-root user
USER ${USER}

# Use entrypoint script
ENTRYPOINT ["/bin/bash", "/app/entrypoint.sh"]
