import React from 'react';

import Grid from '@material-ui/core/Grid';

import { useSubscription, useQuery } from 'react-apollo-hooks';
import { Expense } from './Expense';
import { EXPENSES_FETCH_QUERY, EXPENSE_ADD_SUBSCRIPTION } from './api/api';


export const ExpensesList = ({ }) => {
	const { data, error, loadingTransactions
	} = useQuery(EXPENSES_FETCH_QUERY);

	// use of graphql subscription
	useSubscription(
		EXPENSE_ADD_SUBSCRIPTION, {
		onSubscriptionData: ({ client, subscriptionData: { data: { expenseAdded } } }) => {
			console.log('subcription data', expenseAdded);
			// we can update the list here too, or cache
		}
	}
	);
	// user variables for complex booleans
	const loading = !data || !data.expenses || (error || loadingTransactions)
	const allhandleded = !loading && !data.expenses.length;
	return (
		<div style={{ padding: 10 }}>
			<Grid
				container
				direction="column"
				justify="center"
				alignItems="center"
			>
				{loading && <div>Loading</div>}
				{!loading && data.expenses.map(expense =>
					<Expense key={expense.id} expense={expense}></Expense>
				)}
				{allhandleded &&
					<div>All Transactions Handled</div>}
			</Grid>
		</div>
	);
};
