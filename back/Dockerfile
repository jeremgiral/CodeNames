# Node v8.
FROM node:12-alpine

# On défini le dossier root du projet.
WORKDIR /usr/src/app

# On copie les différents fichiers de configuration et de gestion de dépendances.
COPY ["package.json", "npm-shrinkwrap.json*", "./"]

COPY src/ /usr/src/app

RUN npm install --silent --production

EXPOSE 3000

CMD ["npm", "start"]