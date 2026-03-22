import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import userService from "../services/userService.js";

export function configurePassport() {
	const opts = {
		jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		secretOrKey: process.env.JWT_SECRET,
	};

	passport.use(
		new JwtStrategy(opts, async (payload, done) => {
			try {
				const user = await userService.findById(payload.id);

				if (!user) return done(null, false);

				return done(null, userService.sanitizeUser(user));
			} catch (err) {
				return done(err, false);
			}
		}),
	);
}
