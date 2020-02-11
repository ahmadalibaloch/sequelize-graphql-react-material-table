import React from 'react';
import MaterialTable from 'material-table';
import { tableIcons } from './tableIcons';

import Checkbox from '@material-ui/core/Checkbox';

import { useMutation } from 'react-apollo-hooks';
import { EXPENSE_APPROVAL_MUTATION, EXPENSES_FETCH_QUERY, EXPENSE_ADD_SUBSCRIPTION } from '../api/api';
import { useSubscription, useQuery } from 'react-apollo-hooks';
import { } from '../api/api';


export const ExpensesList = ({ }) => {
	const { data = [], error, loadingTransactions
	} = useQuery(EXPENSES_FETCH_QUERY);

	// use of graphql subscription
	useSubscription(
		EXPENSE_ADD_SUBSCRIPTION, {
		onSubscriptionData: ({ client, subscriptionData: { data: { expenseAdded } } }) => {
			console.log('subcription data', expenseAdded);
			// we can update the list here too, or cache
		}
	});
	// update local cache on client after mutating approval status
	const updateCache = (cache, { data: { setExpenseApproval = undefined, } }) => {
		const { expenses } = cache.readQuery({ query: EXPENSES_FETCH_QUERY });
		const theExpense = expenses.find(e => e.uuid === setExpenseApproval.uuid);
		theExpense.approved = setExpenseApproval.approved;
		cache.writeQuery({
			query: EXPENSES_FETCH_QUERY,
			data: {
				expenses: expenses,
			}
		});
	};

	const [setExpenseApproval] = useMutation(EXPENSE_APPROVAL_MUTATION, {
		update: updateCache,
	});

	const toggleApproval = (uuid, currentApprovalStatus) => {
		setExpenseApproval({ variables: { uuid, approved: !currentApprovalStatus } });
	}
	// user variables for complex booleans
	const loading = !data || (error || loadingTransactions)
	return (
		<div style={{ padding: 10 }}>
			<MaterialTable
				icons={tableIcons}
				isLoading={!!loading}
				title="Expenses List"
				columns={[
					{ title: 'First Name', field: 'employee.first_name' },
					{ title: 'Last Name', field: 'employee.last_name' },
					{ title: 'Expense', field: 'amount' },
					{ title: 'Created', field: 'created_at', type: 'date' },
					{
						title: 'Currency',
						field: 'currency',
					},
					{
						title: 'Approval', field: 'approved',
						render: expense =>
							<Checkbox
								onClick={e => toggleApproval(expense.uuid, expense.approved)}
								checked={expense.approved}
								inputProps={{ 'aria-label': 'Approval State' }}
							/>
					},
				]}
				data={data.expenses}
				options={{
					sorting: true
				}}
			/>
		</div>
	);
};
