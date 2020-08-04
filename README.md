# proffy-server

Node server for [Proffy](https://github.com/danilobjr/proffy). App built during 2nd [Next Level Week](https://nextlevelweek.com) @ [RocketSeat](https://rocketseat.com.br/).

## Installation

```
git clone https://github.com/danilobjr/proffy-server.git
cd proffy-server
yarn install
```

Or if you don't have [Yarn](https://yarnpkg.com/) installed, you can use [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm). In this case, just remember to remove the useless `yarn.lock`. NPM will create a `package.lock` file instead.

```
npm install
```

## Running

After installation just run the following command.

```
yarn dev
```

For NPM users.

```
npm run dev
```

Now you can access `localhost:9000` in your browser. For a fast development workflow, everytime you change a file in `src` folder, the server will restart.

## Migrations

After create a migration file at `src/database/migrations` folder, you can run the following command in your terminal to update data base.

```
yarn migrate:latest
```

For NPM.

```
npm run migrate:latest
```
