import passport from "passport";

const requireAuth = (req, res, next) => {
	passport.authenticate("jwt", { session: false }, (err, user) => {
		if (err) return next(err);
		if (!user) return res.status(401).json({ message: "Unauthorized" });

		req.user = user;
		next();
	})(req, res, next);
};

const requireAdmin = [
	requireAuth,
	(req, res, next) => {
		if (req.user.role !== "ADMIN") {
			return res.status(403).json({ message: "Forbidden" });
		}
		next();
	},
];

export { requireAuth, requireAdmin };
