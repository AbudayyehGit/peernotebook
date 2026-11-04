# Step 1: Build the application
FROM node:18-alpine AS build
WORKDIR /app

# Copy package configuration files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Build the production files (Vite outputs to the /dist folder)
RUN npm run build

# Step 2: Serve the application using Nginx
FROM nginx:alpine

# Copy the compiled production assets from the build stage to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Configure Nginx to listen on port 8080 (Cloud Run's default port)
RUN sed -i 's/listen\.+80;/listen 8080;/g' /etc/nginx/conf.d/default.conf

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
