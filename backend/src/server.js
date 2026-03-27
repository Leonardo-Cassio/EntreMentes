require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const humorRoutes = require('./routes/humorRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/auth', authRoutes);
app.use('/humor', humorRoutes);
app.use('/users', userRoutes);

app.get('/', (req, res) => res.send("API OK"));

app.listen(3000, () => console.log("Rodando na porta 3000"));