import { body, validationResult } from "express-validator";

// this one is just an example, delete later:
export const validateUser = [
	body("username") // assuming username is email address
		.trim()
		.notEmpty()
		.withMessage("Email address is required")
		.isEmail()
		.withMessage("Must be a valid email address"),
	body("password")
		.notEmpty()
		.withMessage("Password is required")
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters"),
	body("verifyPassword") // custom validation
		.notEmpty()
		.withMessage("Please verify your password")
		.custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error("Passwords do not match");
			}
			return true; // validation passed
		}),
	body("firstName").trim().notEmpty().withMessage("First name is required"),
	body("lastName").trim().notEmpty().withMessage("Last name is required"),
];

export const validateRegister = [];

export const validateLogin = [];

export const validateUpdateProfile = [];

export const validateChangePassword = [];

export const validateCreateChat = [];

export const validateEditChat = [];

export const validateCreateMessage = [];

export const validateUpdateMessage = [];

export function handleValidationErrors(view) {
	return (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).render(view, {
				errors: errors.array(),
				userInput: req.body,
			});
		}
		next();
	};
}
