const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const winston = require('winston');

// Create a logger instance
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

router.use(express.json());

// User registration
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('dateOfBirth').notEmpty().withMessage('Date of birth is required'),
    body('age').notEmpty().withMessage('Age is required'),
    body('gender').notEmpty().withMessage('Gender is required')
  ],
  async (req, res) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, dateOfBirth, age, gender } = req.body;

    try {
      // Check if the email already exists
      let user = await User.findOne({ where: { email } });
      if (user) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create the user
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        dateOfBirth,
        age,
        gender
      });

      res.json(user);
    } catch (error) {
      logger.error(`Error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }
);

// User authentication route
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if the user exists
      const user = await User.findOne({ where: { email } });
      logger.info(`Provided Email: ${email}`);
      logger.info(`Provided Password: ${password}`);
      logger.info(`User: ${user}`);
      logger.info(`Hashed Password in Database: ${user?.password}`);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if the password matches
      const isPasswordValid = await bcrypt.compare(password, user.password);
      logger.info(`Password Comparison Result: ${isPasswordValid}`);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate a JWT token
      const token = jwt.sign({ userId: user.id }, 'secret_token');
      logger.info(`Token: ${token}`);
      res.json({ token });
    } catch (error) {
      logger.error(`Error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }
);

// Protected route (requires authentication)
router.get('/protected', authenticateUser, (req, res) => {
  // This route will only be called if the user is authenticated
  res.json({ message: 'Authenticated user' });
});

// Middleware function for user authentication
function authenticateUser(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, 'secret_token');
    req.userId = decoded.userId; // Assuming the payload contains a 'userId' property
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Get all users
router.get('/', (req, res) => {
  User.findAll()
    .then((users) => {
      logger.info(`GET /users`);
      res.json(users);
    })
    .catch((error) => {
      logger.error(`Error: ${error.message}`);
      res.status(500).json({ error: error.message });
    });
});

// Get a user by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  User.findByPk(id)
    .then((user) => {
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    })
    .catch((error) => {
      logger.error(`Error: ${error.message}`);
      res.status(500).json({ error: error.message });
    });
});

// Update a user
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  User.findByPk(id)
    .then((user) => {
      if (user) {
        user.name = name;
        user.email = email;
        user.save()
          .then((updatedUser) => {
            res.json(updatedUser);
          })
          .catch((error) => {
            logger.error(`Error: ${error.message}`);
            res.status(500).json({ error: error.message });
          });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    })
    .catch((error) => {
      logger.error(`Error: ${error.message}`);
      res.status(500).json({ error: error.message });
    });
});

// Delete a user
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  User.findByPk(id)
    .then((user) => {
      if (user) {
        user.destroy()
          .then(() => {
            res.json({ message: 'User deleted successfully' });
          })
          .catch((error) => {
            logger.error(`Error: ${error.message}`);
            res.status(500).json({ error: error.message });
          });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    })
    .catch((error) => {
      logger.error(`Error: ${error.message}`);
      res.status(500).json({ error: error.message });
    });
});

module.exports = router;
