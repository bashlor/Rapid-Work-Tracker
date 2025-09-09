#!/bin/sh
cd apps/rapidwork-web
node ace migration:run --force
node bin/server.js