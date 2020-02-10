import gql from 'graphql-tag';

export const EXPENSE_APPROVAL_MUTATION = gql`
		mutation setExpenseApproval($id: String!, $approved: Boolean!){
			setExpenseApproval(id: $id, approved:$approved){
				id, approved
			}
		}
	`;

export const EXPENSES_FETCH_QUERY = gql`
	{
		expenses {
				id,
				amount,
				description,
				created_at,
				currency,
				approved,
				employee {
					  id,name
				}
		}
	}
`;

export const EXPENSE_ADD_SUBSCRIPTION = gql`
subscription{
	expenseAdded{
	  id
	  approved
	  amount
	  employee{
		id
		name
	  }
	  created_at
	}
  }
  `;