import jsonServer from "json-server";
import path from "path";

const server = jsonServer.create();
const router = jsonServer.router(path.join(process.cwd(), "db.json"));
const middlewares = jsonServer.defaults();

const PORT = process.env.PORT || 10000;

server.use(middlewares);
server.use(router);
server.listen(PORT, () => {
  console.log(`✅ API corriendo en el puerto ${PORT}`);
});
