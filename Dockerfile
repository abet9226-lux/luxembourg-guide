FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Static site
COPY . .

# Nginx listens on 80 by default
