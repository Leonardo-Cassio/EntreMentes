require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const humorRoutes = require('./routes/humorRoutes');
const moodRoutes = require('./routes/moodRoutes');

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/humor', humorRoutes);
app.use('/mood', moodRoutes);

app.get('/', (req, res) => res.json({ success: true, message: "API EntreMentes OK" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
