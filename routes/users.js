const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.use(express.json())

router.post('/', (req, res) => {
  const { name, email } = req.body;
  User.create({ name, email })
    .then((user) => {
      res.json(user);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});


router.get('/', (req, res) => {
  User.findAll()
    .then((users) => {
      res.json(users);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});


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
      res.status(500).json({ error: error.message });
    });
});


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
            res.status(500).json({ error: error.message });
          });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});


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
            res.status(500).json({ error: error.message });
          });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

module.exports = router;