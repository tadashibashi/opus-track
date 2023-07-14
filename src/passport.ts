import passport, {Profile} from "passport";
import {OAuth2Strategy as GoogleStrategy, VerifyFunction} from "passport-google-oauth";
import {getEnv} from "./util";
import mongoose from "mongoose";
import User from "./models/User";

import {Express} from "express";
import session from "express-session";

export function setupPassport(server: Express) {
    passport.use(new GoogleStrategy({
            clientID: getEnv("GOOGLE_CLIENT_ID"),
            clientSecret: getEnv("GOOGLE_SECRET"),
            callbackURL: getEnv("GOOGLE_CALLBACK"),
        },
        // Called when user verified via Google Strategy
        async function(accessToken: string, refreshToken: string, profile: Profile, cb: VerifyFunction) {
            try {
                let user = await User.findOne({googleId: profile.id});

                const email = profile.emails?.at(0) as {value: string, verified: boolean};

                if (!user) {
                    user = await User.create({
                        googleId: profile.id,
                        firstName: profile.name?.givenName || "",
                        lastName: profile.name?.familyName || "",
                        username: profile.username || profile.displayName, // May be undefined? It will throw mongoose validation error, if so.
                        email: email.value || "",
                        emailVerified: email.verified || false,
                        avatar: profile.photos?.at(0)?.value || "",
                    });
                }

                console.log("User logged in: ", user);

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

    server.use(session({
        secret: getEnv("SESSION_SECRET"),
        resave: false,
        saveUninitialized: true,
    }));

    server.use(passport.initialize());

    server.use(passport.session());
}
