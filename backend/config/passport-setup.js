const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in our db
        const existingUser = await User.findOne({ where: { googleId: profile.id } });

        if (existingUser) {
          // Already have the user
          return done(null, existingUser);
        }

        // Check if user exists with the same email
        const emailUser = await User.findOne({ where: { email: profile.emails[0].value } });
        if (emailUser) {
          // User exists with email, link googleId to that account
          emailUser.googleId = profile.id;
          await emailUser.save();
          return done(null, emailUser);
        }

        // If not, create a new user in our db
        const newUser = await User.create({
          googleId: profile.id,
          username: profile.displayName.replace(/\s/g, '') + profile.id, // Create a unique username
          name: profile.displayName,
          email: profile.emails[0].value,
          profile_picture: profile.photos[0].value,
        });

        done(null, newUser);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}); 