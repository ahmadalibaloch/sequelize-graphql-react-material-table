import React from 'react';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';

import { ApolloClient } from 'apollo-client';
import { split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo-hooks';

import './index.css';

import { Header } from './Header';
import { ExpensesList } from './expenses/ExpensesList'


const httpLink = new HttpLink({
	uri: 'http://localhost:3001/graphql',
});

const wsLink = new WebSocketLink({
	uri: 'ws://localhost:3001/graphql',
	options: {
		reconnect: true,
	},
});

const link = split(
	({ query }) => {
		const { kind, operation } = getMainDefinition(query);
		return kind === 'OperationDefinition' && operation === 'subscription';
	},
	wsLink,
	httpLink,
);
const cache = new InMemoryCache();
/*
uncomment and pass to client if want to disable cache
const defaultOptions = {
	watchQuery: {
		fetchPolicy: 'no-cache',
		errorPolicy: 'ignore',
	},
	query: {
		fetchPolicy: 'no-cache',
		errorPolicy: 'all',
	},
}
*/
const client = new ApolloClient({ link, cache });


export const App = () => {

	const containerStyle = makeStyles({ container: { padding: 20, maxWidth: 'sm' } });
	return (
		<ApolloProvider client={client}>
			<div className="App">
				<Header />
				<Container className={containerStyle.container}>
					<ExpensesList client={client} />
				</Container>
			</div>
		</ApolloProvider>
	);
};
