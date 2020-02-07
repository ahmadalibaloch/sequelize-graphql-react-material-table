import React from 'react';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import { Money, CalendarToday } from '@material-ui/icons';

import { useMutation } from 'react-apollo-hooks';
import { ALLOW_TRANSACTION_MUTATION, BlOCK_TRANSACTION_MUTATION, TRANSACTIONS_FETCH_QUERY } from './api/api';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
	card: {
		maxWidth: 345,
		minWidth: 400,
		margin: 10,
	},
});



export const Transaction = ({ transaction }) => {
	const classes = useStyles();
	// update local cache on client
	const updateCache = (cache, { data: { allowTransaction = undefined, blockTransaction = undefined } }) => {
		const { pendingTransactions } = cache.readQuery({ query: TRANSACTIONS_FETCH_QUERY });
		const transaction = allowTransaction ? allowTransaction : blockTransaction;
		cache.writeQuery({
			query: TRANSACTIONS_FETCH_QUERY,
			data: {
				pendingTransactions: pendingTransactions.filter(t => t.id !== transaction.id),
			}
		});
	};
	
	const [allowTransactionHook] = useMutation(ALLOW_TRANSACTION_MUTATION, {
		update: updateCache,
	});
	const [blockTransactionHook] = useMutation(BlOCK_TRANSACTION_MUTATION, {
		update: updateCache,
	});


	const blockTransaction = (transactionId) => {
		blockTransactionHook({ variables: { id: transactionId } });
	}
	const allowTransaction = (transactionId) => {
		allowTransactionHook({ variables: { id: transactionId } });
	}

	return (
		<Card className={classes.card}>
			<CardActionArea>
				<CardContent>
					<Typography gutterBottom variant="h5" component="h2">
						{transaction.toUser}
					</Typography>
					<Typography variant="body2" color="textSecondary" component="p">
						Sent from {transaction.fromUser}
					</Typography>
					<List subheader={<ListSubheader>Transaction Details</ListSubheader>} className={classes.root}>
						<ListItem>
							<ListItemIcon>
								<Money></Money>
							</ListItemIcon>
							<ListItemText id="switch-list-label-wifi" primary={`$${transaction.amount}`} />
						</ListItem>
						<ListItem>
							<ListItemIcon>
								<CalendarToday></CalendarToday>
							</ListItemIcon>
							<ListItemText id="switch-list-label-bluetooth" primary={transaction.date} />
						</ListItem>
					</List>
				</CardContent>
			</CardActionArea>
			<CardActions style={{ justifyContent: 'flex-end' }}>
				<Button size="small" color="secondary" variant="contained" onClick={() => { blockTransaction(transaction.id) }} >
					Block
							</Button>
				<Button size="small" color="primary" variant="contained" onClick={() => { allowTransaction(transaction.id) }}>
					Allow
							</Button>
			</CardActions>
		</Card>
	);
};
