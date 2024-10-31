const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/google/callback',  
    }, (accessToken, refreshToken, profile, done) => {
        User.findOne({ googleId: profile.id }).then((currentUser) => {
            if (currentUser) {
                return done(null, currentUser);
            } else {
                new User({
                    googleId: profile.id,
                    displayName: profile.displayName,
                    email: profile.emails[0].value,
                }).save().then((newUser) => {
                    done(null, newUser);
                })
            }
        })
    })
);
