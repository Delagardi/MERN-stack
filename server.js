const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Connection to the database
connectDB();

app.get('/', (req, res) => res.send('API running'));

// Define routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));


const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on ${PORT} port`));