import { NextFunction, Request, Response } from "express";
import { body, param, validationResult } from "express-validator";

const handleValidation = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: errors.array({ onlyFirstError: true })[0].msg,
    });
    return;
  }

  next();
};

export const createUserRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("A valid email is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
];

export const loginRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

export const createSiteRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required"),
  body("location")
    .trim()
    .notEmpty()
    .withMessage("Location is required"),
  body("owner")
    .isMongoId()
    .withMessage("Owner must be a valid user id"),
];

export const updateSiteOwnerRules = [
  param("siteId")
    .isMongoId()
    .withMessage("Invalid solar site id"),
  body("owner")
    .isMongoId()
    .withMessage("Owner must be a valid user id"),
];

export const createDeviceRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required"),
  body("deviceId")
    .trim()
    .notEmpty()
    .withMessage("deviceId is required"),
  body("site")
    .isMongoId()
    .withMessage("Site must be a valid solar site id"),
];

export const createReadingRules = [
  body("deviceId")
    .trim()
    .notEmpty()
    .withMessage("deviceId is required"),
  body("voltage")
    .isFloat({ min: 0 })
    .withMessage("Voltage must be a non-negative number"),
  body("current")
    .isFloat({ min: 0 })
    .withMessage("Current must be a non-negative number"),
];

export default handleValidation;
