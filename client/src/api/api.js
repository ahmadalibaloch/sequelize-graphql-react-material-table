import gql from 'graphql-tag';

export const EXPENSE_APPROVAL_MUTATION = gql`
		mutation setExpenseApproval($uuid: String!, $approved: Boolean!){
			setExpenseApproval(uuid: $uuid, approved: $approved){
				uuid, approved
			}
		}
	`;

export const EXPENSES_FETCH_QUERY = gql`
	{
		expenses {
				uuid,
				amount,
				description,
				created_at,
				currency,
				approved,
				employee {
					uuid
					first_name
					last_name
				}
		}
	}
`;

export const EXPENSE_ADD_SUBSCRIPTION = gql`
	subscription {
			expenseAdded {
				expense {
					uuid
					approved
					amount
					created_at
					employee{
						uuid
						first_name
						last_name
					}
				}
				count				
		}
	}
  `;