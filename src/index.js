const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username );

  if(!user) {
    return response.status(400).json({error: "Username not found."});
  }

  request.user = user;
  return next();
}

function checkTodoIdExists(user, id) {
  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo) {
    return response.status(404).json({error: "To-do task not found"});
  }
  else return true;
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userExists = users.some( 
    (user) => user.username === username
  );

  if (userExists) {
    return response.status(400).json({error: "This username is already being used."});
  }

  const id = uuidv4();
  const todos = [];

  users.push({
    id,
    name,
    username,
    todos,
    
  });

  return response.status(201).json({
    id,
    name,
    username,
    todos
  });


});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers;
  const { user } = request;
  
  return response.json(
    user.todos
  );
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  // const id = uuidv4();

  const todo ={
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()

  };

  user.todos.push(todo);

  return response.status(201).send(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id } = request.params;
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo) {
    return response.status(404).json({error: "To-do task not found"});
  }

  todo.title = title;
  todo.deadline = deadline;

  return response.status(201).json(todo);


  
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const {id} = request.params;
 
console.log("id:" + id);
  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo) {
    return response.status(404).json({error: "To-do task not found"});
  }

  todo.done = true;
  return response.status(201).json(todo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo) {
    return response.status(404).json({error: "To-do task not found"});
  }

  user.todos.splice(todo,1);

  return response.status(204).json(user.todos);
  
});

module.exports = app;