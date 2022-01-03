const passport = require('passport');
const GoogleTokenStrategy = require('passport-google-token').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');
const User = require("../models/User");

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    })
})

const getGoogleProfile = (profile) => {
    const { id, displayName, emails, provider } = profile;
    if (emails && emails.length) {
        const email = emails[0].value;
        return { googleId: id, name: displayName, email:  email, provider };
    }
    return null;
};
const getFacebookProfile = (profile) => {
    const { id, displayName, emails, provider } = profile;
    if (emails && emails.length) {
        const email = emails[0].value;
        return { facebookId: id, name: displayName, email: email, provider };
    }
    return null;
};

passport.use(new GoogleTokenStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
}, (accessToken, refreshToken, profile, done) => {
    User.findOne({ googleId: profile.id })
        .then((existingUser) => {
            if (existingUser) {
                done(null, existingUser);
            } else {
                new User(getGoogleProfile(profile)).save().then((user) => done(null, user));
            }
        })
}));

passport.use(new FacebookTokenStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
}, (accessToken, refreshToken, profile, done) => {
    User.findOne({ facebookId: profile.id })
        .then((existingUser) => {
            if (existingUser) {
                done(null, existingUser);
            } else {
                new User(getFacebookProfile(profile)).save().then((user) => done(null, user));
            }
        })
}
));