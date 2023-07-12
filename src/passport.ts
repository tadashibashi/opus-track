import passport, {Profile} from "passport";
import {OAuth2Strategy as GoogleStrategy, VerifyFunction} from "passport-google-oauth";
import {getEnvironmentVar} from "./util";
import mongoose, {get} from "mongoose";
import User from "./models/User";



passport.use(new GoogleStrategy({
        clientID: getEnvironmentVar("GOOGLE_CLIENT_ID"),
        clientSecret: getEnvironmentVar("GOOGLE_SECRET"),
        callbackURL: getEnvironmentVar("GOOGLE_CALLBACK"),
    },
    // Called when user verified via Google Strategy
    async function(accessToken: string, refreshToken: string, profile: Profile, cb: VerifyFunction) {
        try {
            let user = await User.findOne({googleId: profile.id});

            if (!user) {
                user = await User.create({
                    googleId: profile.id,
                    name: profile.name,
                    email: profile.emails?.at(0) || "",
                    avatar: profile.photos?.at(0) || "",
                });
            }

            return cb(null, user);
        } catch(err) {
            if (err instanceof Error)
                console.error(err);
            return cb(err);
        }
    }));

passport.serializeUser(function(user, cb) {
    if (user instanceof mongoose.Model)
        cb(null, user._id);
    else
        cb(new TypeError("passport.serializeUser callback must receive an instance of mongoose.Model!"));
});

passport.deserializeUser(async function(userId, cb) {
     if (userId instanceof mongoose.Types.ObjectId || typeof userId === "string") {
         cb(null, await User.findById(userId));
     } else {
         cb(new TypeError("passport.deserializeUser callback must receive a userId string or object!"));
     }
});
