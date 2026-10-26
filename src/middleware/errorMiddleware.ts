import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

interface AppError extends Error {
  statusCode?: number;
}

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let statusCode = 500;
  let message = "Server error";

  if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((e) => e.message)
      .join("; ");
  } else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid value for ${error.path}`;
  } else if (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: number }).code === 11000
  ) {
    statusCode = 409;
    message = "Duplicate value entered";
  } else if (typeof error === "object" && error !== null) {
    const appError = error as AppError;

    if (appError.statusCode) {
      statusCode = appError.statusCode;
    }

    if (appError.message && statusCode !== 500) {
      message = appError.message;
    }
  }

  if (statusCode === 500) {
    console.error("Unhandled error:", error);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
