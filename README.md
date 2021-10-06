# GraphQL - Sequelize - Apollo - React - Hooks - Material Design - Scss

Even in the world of startups and company builders expenses for trips etc. have to be filed and managed.
The fictitious expense software Cashcog tries to manage this. Unfortunately, there is some functionality missing which you have to create.
The Cashcog-API only offers events about newly created expenses. The approval process however is missing and has to be added externally.

![Demo](https://github.com/ahmadalibaloch/sequelize-graphql-react-material-table/blob/master/demo.png)

### Part 1 – BE-Part
Consume the expense events provided by the Cashcog Expense-API. Validate and store them in a database of your choice.
Create a Graph-QL or RESTful-API which allows clients to fetch, update (approve or decline), and query these expenses.

### Part 2 – FE-Part
Visualize the approval process in a web application. The user should be able to get all expenses from the BE system, query/filter and sort them, and approve or decline them. Create an UI which is intuitive and responsive so it works on both, desktop and mobile platforms.

After completing the assignment please provide me with your source-code on an accessible git repository or add me as a collaborator on github (user: mwelack). Also make sure your code can be executed easily in different environments.

## Server App
In ./server/ start the web server using
```bash
npm install
npm start
```

TO start a database instance using docker
```
docker run --rm   --name pg-docker -e POSTGRES_PASSWORD=123 -d -p 5432:5432 -v
```

## Web App
In ./client/ start the web server using
```bash
npm install
npm start
```

A browser should automatically navigate to
 ```http://localhost:3000/```


 😊🙌

