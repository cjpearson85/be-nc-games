# House of Games API

## Hosted project
https://nc-games-chris.herokuapp.com/api

## Summary

A back-end API of game reviews with associated comments, users and categories.

## Installation

- git clone "https://github.com/cjpearson85/be-nc-games.git"
- npm install
- npm run setup-dbs
- You will need to create _two_ `.env` files: `.env.test` and `.env.development`. Into each, add `PGDATABASE=<database_name_here>`, with the correct database name for that environment (`nc_games_test` for `.env.test` and `nc_games` for `.env.development`). Double check that these `.env` files are .gitignored.
- npm run seed
- npm start

## Minimum requirements

- Node v16.0.0
- PostgreSQL 13.2