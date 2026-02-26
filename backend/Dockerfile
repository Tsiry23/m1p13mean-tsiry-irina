# Image Node officielle
FROM node:20-alpine

# Dossier de travail dans le conteneur
WORKDIR /app

# Copier les dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code
COPY . .

# Exposer le port Express
EXPOSE 3000

# Lancer le serveur
CMD ["npm", "start"]