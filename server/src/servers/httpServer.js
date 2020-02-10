const Koa = require('koa');
const KoaRouter = require('koa-router');

module.exports.startHttpServer =
  ({
     apolloServer,
     subscriptionServer,
     port,
   }) => {
    const app = new Koa();
    const router = new KoaRouter();

    router.get('/status', ctx => {
      ctx.body = { status: 'koa is working...' };
    });

    app.use(router.routes());
    app.use(router.allowedMethods());
    apolloServer(app);

    const server = app.listen(port);
    subscriptionServer(server);

    console.log(`🚀 Apollo Server Running at http://localhost:${ port }/graphql`);
  };
