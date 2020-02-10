const { ApolloServer } = require('apollo-server-koa');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { execute, subscribe } = require('graphql');

module.exports.startGraphQLServer = ({ schema, context }) => {
  const apolloServer =
    new ApolloServer({
      schema,
      introspection: true,
      playground: true,
      mocks: false,
      mockEntireSchema: false,
      context,
    });

  const subscriptionServer = (http) => new SubscriptionServer(
    {
      execute,
      subscribe,
      schema,
      onConnect: () => {
        return Promise.resolve(context);
      },
    },
    {
      server: http,
      path: '/graphql',
    },
  );

  return {
    apolloServer: app => apolloServer.applyMiddleware({ path: '/graphql', app }),
    subscriptionServer,
  }
};
