import React from 'react';

import Grid from '@material-ui/core/Grid';

import { useSubscription, useQuery } from 'react-apollo-hooks';
import { Transaction } from './Transaction';
import { TRANSACTIONS_FETCH_QUERY, TRANSACTION_UDPATED_SUBSCRIPTION } from './api/api';


export const TransactionsList = ({ }) => {
	const { data, error, loadingTransactions
	} = useQuery(TRANSACTIONS_FETCH_QUERY);

	// use of graphql subscription
	useSubscription(
		TRANSACTION_UDPATED_SUBSCRIPTION, {
			onSubscriptionData: ({ client, subscriptionData: { data: { transactionUpdated } } }) => {
				console.log('subcription data', transactionUpdated);
				// we can update the list here too, or cache
			}
		}
	);
	// user variables for complex booleans
	const loading = !data || !data.pendingTransactions || (error || loadingTransactions)
	const allhandleded = !loading && !data.pendingTransactions.length;
	return (
		<div style={{ padding: 10 }}>
			<Grid
				container
				direction="column"
				justify="center"
				alignItems="center"
			>
				{loading && <div>Loading</div>}
				{!loading && data.pendingTransactions.map(transaction =>
					<Transaction key={transaction.id} transaction={transaction}></Transaction>
				)}
				{allhandleded &&
					<div>All Transactions Handled</div>}
			</Grid>
		</div>
	);
};
