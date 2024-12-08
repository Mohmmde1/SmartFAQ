# Use official Nginx image
FROM nginx:alpine

# Copy the custom Nginx config file
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
