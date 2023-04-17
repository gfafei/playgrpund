import Koa from 'koa'
const app = new Koa()

app.use(async ctx => {
  ctx.body = 'Hello, world'
})

const server = app.listen(3000);
export default server;
