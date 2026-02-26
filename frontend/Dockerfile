# ----------- Build Angular -----------
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration production


# ----------- Nginx -----------
FROM nginx:alpine

# SUPPRIME la config par défaut
RUN rm /etc/nginx/conf.d/default.conf

# COPIE TA CONFIG
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Supprime la config par défaut (optionnel mais propre)
RUN rm -rf /usr/share/nginx/html/*

# COPIE CORRECTE DU BUILD ANGULAR
COPY --from=build /app/dist/frontend /usr/share/nginx/html

# RUN chmod -R 777 /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]