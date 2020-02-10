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
import { EXPENSE_APPROVAL_MUTATION, EXPENSES_FETCH_QUERY } from './api/api';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
	card: {
		maxWidth: 345,
		minWidth: 400,
		margin: 10,
	},
});



export const Expense = ({ expense }) => {
	const classes = useStyles();
	// update local cache on client
	const updateCache = (cache, { data: { setExpenseApproval = undefined, } }) => {
		const { expenses } = cache.readQuery({ query: EXPENSES_FETCH_QUERY });
		const theExpense = expenses.find(e => e.id === setExpenseApproval.id);
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



	const setExpenseApprovalStatus = (id, approved) => {
		setExpenseApproval({ variables: { id, approved } });
	}

	return (
		<Card className={classes.card}>
			<CardActionArea>
				<CardContent>
					<Typography gutterBottom variant="h5" component="h2">
						{expense.description}
					</Typography>
					<Typography variant="body2" color="textSecondary" component="p">
						Sent from {expense.employee.name}
					</Typography>
					<List subheader={<ListSubheader>Transaction Details</ListSubheader>} className={classes.root}>
						<ListItem>
							<ListItemIcon>
								<Money></Money>
							</ListItemIcon>
							<ListItemText id="switch-list-label-wifi" primary={`$${expense.amount}`} />
						</ListItem>
						<ListItem>
							<ListItemIcon>
								<CalendarToday></CalendarToday>
							</ListItemIcon>
							<ListItemText id="switch-list-label-bluetooth" primary={expense.created_at} />
						</ListItem>
						<ListItem>
							<ListItemIcon>
								<CalendarToday></CalendarToday>
							</ListItemIcon>
							<ListItemText id="switch-list-label-bluetooth" primary={JSON.stringify(expense.approved)} />
						</ListItem>
					</List>
				</CardContent>
			</CardActionArea>
			<CardActions style={{ justifyContent: 'flex-end' }}>
				<Button size="small" color="secondary" variant="contained" onClick={() => { setExpenseApprovalStatus(expense.id, false) }} >
					Refuse
							</Button>
				<Button size="small" color="primary" variant="contained" onClick={() => { setExpenseApprovalStatus(expense.id, true) }}>
					Approve
							</Button>
			</CardActions>
		</Card>
	);
};
