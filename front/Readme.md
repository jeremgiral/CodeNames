<h1> Front App for Chihiro Project </h1>

<!-- TOC -->

- [A propos](#a-propos)
- [Setup project](#setup-project)
  - [Installer les dépendances](#installer-les-dépendances)
  - [Configurer votre IDE](#configurer-votre-ide)
  - [Start NodeJS Server](#start-nodejs-server)
  - [Build Front](#build-front)
  - [Build Server](#build-server)
  - [Change port](#change-port)
- [Liens](#liens)

<!-- /TOC -->

## A propos

On retrouve ici l'application front du projet Chihiro. Cette application est développée en ReactJS et servie par NodeJS.

On retrouve plusieurs outils bien connus du monde du JS pour nous aider à développer notamment:

* **Babel**: Qui nous permet de gagner en productivité dans notre code grace à des nouvelles syntaxe.
* **ESLint**: Un linter pour le JS qui permet d'unifier la syntaxe sur tout le projet.
* **Prettier**: Module permettant de formater le code à la sauvegarde, il est ici configuré dans .vscode et fonctionne donc que sous VSCode, mais libre à vous de le configurer aussi pour votre IDE préféré

## Setup project

### Installer les dépendances

L'installation des dépendances se fait de façon très simple grâce à NPM

```
npm i
```

### Configurer votre IDE

Pour utiliser les différents modules de ce projet vous devez installer des modules à votre IDE, notamment **ESLint** et **Prettier**

### Start NodeJS Server

```
npm run dev
```

### Build Front

La commande suivant lance Webpack et nous créer alors un bundle.js de notre application React dans public/js/bundle.js

```
npm run dev:build-client
```

### Build Server

La commande suivant lance Webpack et nous créer alors un bundle.js de notre serveur NodeJS dans build/bundle.js

```
npm run dev:build-server
```

### Change port

Le port du server est configuré dans webpack.config.js. Par défaut il est sur le 8080.

```
  devServer: {
    historyApiFallback: true,
    port: 8080
  },
```

## Liens

* [ReactJS](https://reactjs.org)
* [Babel](https://babeljs.io)
* [Webpack](https://webpack.js.org)
* [Prettier](https://prettier.io)
* [NodeJS](https://nodejs.org)
* [Ant Design](https://ant.design)
