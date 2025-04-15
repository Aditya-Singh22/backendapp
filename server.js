const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));//not able to understand

// Azure SQL Server config
const dbConfig = {
  user: 'sqluser',
  password: 'Bub$49416',
  server: 'sqladitya.database.windows.net',
  database: 'db1',
  options: {
    encrypt: true, // for Azure
    trustServerCertificate: false
  }
};

// Serve the HTML form on port 3000 / represents the default page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/register', async (req, res) => {
  const { username, password, email, phone, user_type } = req.body;

  try {
    await sql.connect(dbConfig);

    const query = `
      INSERT INTO Users (username, password, email, phone, user_type)
      VALUES (@username, @password, @email, @phone, @user_type)
    `;

    const request = new sql.Request();
    request.input('username', sql.VarChar, username);
    request.input('password', sql.VarChar, password);
    request.input('email', sql.VarChar, email);
    request.input('phone', sql.VarChar, phone);
    request.input('user_type', sql.VarChar, user_type);

    await request.query(query);

    res.send('User registered successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error registering user');
  }
});


app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

app.post('/login', async (req, res) => {
  const { username, password, user_type } = req.body;

  try {
    await sql.connect(dbConfig);

    const query = `
      SELECT * FROM Users
      WHERE username = @username AND password = @password AND user_type = @user_type
    `;

    const request = new sql.Request();
    request.input('username', sql.VarChar, username);
    request.input('password', sql.VarChar, password);
    request.input('user_type', sql.VarChar, user_type);

    const result = await request.query(query);

    if (result.recordset.length > 0) {
      res.send(`Welcome, ${user_type} ${username}! You have successfully logged in.`);
    } else {
      res.send('Login failed: Invalid credentials or user type.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error during login.');
  }
});



app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});