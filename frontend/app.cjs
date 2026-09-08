/* eslint-disable @typescript-eslint/no-require-imports */
const { createServer } = require("node:http");
const next = require("next");

process.env.NODE_ENV = "production";
process.chdir(__dirname);

const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer((request, response) => handle(request, response)).listen(port);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
