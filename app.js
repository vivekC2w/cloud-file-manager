require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const folderRoutes = require('./routes/folderRoutes');

const app = express();

//Load the configuration and MongoDB connection
require('./config/config');

//Intialize the Passport middleware
require('./controllers/authController');

app.use(express.json());

app.use(
    session({ 
        secret: process.env.SESSION_SECRET, 
        resave: false, 
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        } 
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/files', fileRoutes);
app.use('/folders', folderRoutes);


//Root route
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/dashboard');
    } else {
        res.send('Welcome! Please <a href="/auth/login">login</a> to continue.');
    }
})

app.get('/dashboard', (req, res) => {
    if (req.isAuthenticated()) {
        res.send(`Hello ${req.user.displayName}, you are logged in!`);
    } else {
        res.redirect('/auth/login');
    }
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.clearCookie('connect.sid'); 
        res.redirect('/');
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
