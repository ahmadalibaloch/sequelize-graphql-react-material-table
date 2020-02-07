import gql from 'graphql-tag';

export const BlOCK_TRANSACTION_MUTATION = gql`
		mutation blockTransaction($id: String!){
			blockTransaction(id: $id){
				id, status
			}
		}
	`;
export const ALLOW_TRANSACTION_MUTATION = gql`
		mutation allowTransaction($id: String!){
			allowTransaction(id: $id){
				id, status
			}
		}
	`;

export const TRANSACTIONS_FETCH_QUERY = gql`
	{
		pendingTransactions {
				id,status, fromUser, toUser, amount, date
		}
	}
`;

export const TRANSACTION_UDPATED_SUBSCRIPTION = gql`
	subscription{
		transactionUpdated{
			id
			status
			amount
			fromUser
			toUser
		}
  	}
  `;