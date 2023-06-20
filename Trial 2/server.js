const express = require('express');
const winston = require('winston');
const app = express();

const port = 3000;

// Configure Winston logger
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' })
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
});

// Middleware for logging requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Middleware for parsing JSON data
app.use(express.json());

// Routes
const usersRoute = require('./routes/users');
app.use('/users', usersRoute);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
