/**
 * Centralized Error Handling System
 * Provides typed error codes, user-friendly messages, and retry logic
 */

export enum ErrorCode {
  // Validation
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_AMOUNT = "INVALID_AMOUNT",
  INVALID_CORRIDOR = "INVALID_CORRIDOR",
  INVALID_WALLET_ADDRESS = "INVALID_WALLET_ADDRESS",

  // Authentication
  UNAUTHORIZED = "UNAUTHORIZED",
  WALLET_NOT_CONNECTED = "WALLET_NOT_CONNECTED",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  INVALID_SIGNATURE = "INVALID_SIGNATURE",

  // Wallet
  WALLET_SIGN_FAILED = "WALLET_SIGN_FAILED",
  WALLET_USER_REJECTED = "WALLET_USER_REJECTED",
  WALLET_NOT_INSTALLED = "WALLET_NOT_INSTALLED",

  // Transaction
  TRANSACTION_FAILED = "TRANSACTION_FAILED",
  TRANSACTION_TIMEOUT = "TRANSACTION_TIMEOUT",
  TRANSACTION_REJECTED = "TRANSACTION_REJECTED",

  // Rates & Routing
  NO_ROUTES_AVAILABLE = "NO_ROUTES_AVAILABLE",
  CORRIDOR_NOT_FOUND = "CORRIDOR_NOT_FOUND",
  RATES_STALE = "RATES_STALE",
  RATE_UPDATE_FAILED = "RATE_UPDATE_FAILED",

  // API
  API_ERROR = "API_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  REQUEST_TIMEOUT = "REQUEST_TIMEOUT",
  RATE_LIMITED = "RATE_LIMITED",

  // Server
  INTERNAL_ERROR = "INTERNAL_ERROR",
  NOT_FOUND = "NOT_FOUND",
  BAD_REQUEST = "BAD_REQUEST",

  // Unknown
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export type ErrorSeverity = "info" | "warning" | "error" | "critical";

export interface AppError {
  code: ErrorCode;
  message: string; // Technical message
  userMessage: string; // User-friendly message
  severity: ErrorSeverity;
  details?: Record<string, unknown>;
  originalError?: Error;
  timestamp: number;
  retryable: boolean;
}

/**
 * Maps error codes to user-friendly messages
 */
const ERROR_MESSAGES: Record<ErrorCode, { message: string; severity: ErrorSeverity }> = {
  [ErrorCode.VALIDATION_ERROR]: {
    message: "Please check your input and try again.",
    severity: "warning",
  },
  [ErrorCode.INVALID_AMOUNT]: {
    message: "Please enter a valid amount between 0.01 and 1,000,000.",
    severity: "warning",
  },
  [ErrorCode.INVALID_CORRIDOR]: {
    message: "This corridor is not currently available. Please select another.",
    severity: "warning",
  },
  [ErrorCode.INVALID_WALLET_ADDRESS]: {
    message: "Please enter a valid wallet address.",
    severity: "warning",
  },

  [ErrorCode.UNAUTHORIZED]: {
    message: "You do not have permission to perform this action.",
    severity: "error",
  },
  [ErrorCode.WALLET_NOT_CONNECTED]: {
    message: "Please connect your wallet to continue.",
    severity: "warning",
  },
  [ErrorCode.SESSION_EXPIRED]: {
    message: "Your session has expired. Please log in again.",
    severity: "error",
  },
  [ErrorCode.INVALID_SIGNATURE]: {
    message: "Signature verification failed. Please try again.",
    severity: "error",
  },

  [ErrorCode.WALLET_SIGN_FAILED]: {
    message: "Failed to sign transaction. Please check your wallet and try again.",
    severity: "error",
  },
  [ErrorCode.WALLET_USER_REJECTED]: {
    message: "You rejected the transaction in your wallet.",
    severity: "info",
  },
  [ErrorCode.WALLET_NOT_INSTALLED]: {
    message: "Freighter wallet not found. Please install it to continue.",
    severity: "error",
  },

  [ErrorCode.TRANSACTION_FAILED]: {
    message: "Transaction failed. Please check the details and try again.",
    severity: "error",
  },
  [ErrorCode.TRANSACTION_TIMEOUT]: {
    message: "Transaction took too long. Please check your wallet and try again.",
    severity: "error",
  },
  [ErrorCode.TRANSACTION_REJECTED]: {
    message: "Transaction was rejected. Please try again.",
    severity: "warning",
  },

  [ErrorCode.NO_ROUTES_AVAILABLE]: {
    message: "No payment routes available for this corridor. Try another pair.",
    severity: "warning",
  },
  [ErrorCode.CORRIDOR_NOT_FOUND]: {
    message: "This corridor is not available. Please select another.",
    severity: "warning",
  },
  [ErrorCode.RATES_STALE]: {
    message: "Rates are outdated. Refreshing now...",
    severity: "info",
  },
  [ErrorCode.RATE_UPDATE_FAILED]: {
    message: "Failed to update rates. Please try again.",
    severity: "warning",
  },

  [ErrorCode.API_ERROR]: {
    message: "Server error. Please try again later.",
    severity: "error",
  },
  [ErrorCode.NETWORK_ERROR]: {
    message: "Network connection failed. Please check your internet and try again.",
    severity: "error",
  },
  [ErrorCode.REQUEST_TIMEOUT]: {
    message: "Request took too long. Please try again.",
    severity: "error",
  },
  [ErrorCode.RATE_LIMITED]: {
    message: "Too many requests. Please wait a moment and try again.",
    severity: "warning",
  },

  [ErrorCode.INTERNAL_ERROR]: {
    message: "An unexpected error occurred. Our team has been notified.",
    severity: "critical",
  },
  [ErrorCode.NOT_FOUND]: {
    message: "Resource not found.",
    severity: "error",
  },
  [ErrorCode.BAD_REQUEST]: {
    message: "Invalid request. Please check your input.",
    severity: "warning",
  },

  [ErrorCode.UNKNOWN_ERROR]: {
    message: "An unexpected error occurred.",
    severity: "error",
  },
};

/**
 * Create a typed AppError
 */
export function createError(
  code: ErrorCode,
  message: string,
  userMessage?: string,
  details?: Record<string, unknown>,
  originalError?: Error,
): AppError {
  const config = ERROR_MESSAGES[code] || ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR];

  return {
    code,
    message,
    userMessage: userMessage || config.message,
    severity: config.severity,
    details,
    originalError,
    timestamp: Date.now(),
    retryable: isRetryableError(code),
  };
}

/**
 * Parse any error into a typed AppError
 */
export function parseError(error: unknown): AppError {
  if (error instanceof Error && "code" in error) {
    const appError = error as unknown as AppError;
    return appError;
  }

  if (error instanceof TypeError) {
    if (error.message.includes("fetch")) {
      return createError(
        ErrorCode.NETWORK_ERROR,
        error.message,
        "Network connection failed. Please check your internet and try again.",
        {},
        error,
      );
    }
  }

  if (error instanceof Error) {
    const message = error.message;

    if (message.includes("timeout")) {
      return createError(
        ErrorCode.REQUEST_TIMEOUT,
        message,
        undefined,
        {},
        error,
      );
    }

    if (message.includes("unauthorized")) {
      return createError(
        ErrorCode.UNAUTHORIZED,
        message,
        undefined,
        {},
        error,
      );
    }

    if (message.includes("not found")) {
      return createError(
        ErrorCode.NOT_FOUND,
        message,
        undefined,
        {},
        error,
      );
    }

    return createError(
      ErrorCode.API_ERROR,
      message,
      undefined,
      {},
      error,
    );
  }

  return createError(
    ErrorCode.UNKNOWN_ERROR,
    "An unexpected error occurred",
  );
}

/**
 * Get user-friendly message for error code
 */
export function getErrorMessage(code: ErrorCode): string {
  return ERROR_MESSAGES[code]?.message || ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR].message;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: ErrorCode | AppError): boolean {
  const code = typeof error === "string" ? error : error.code;

  const retryableCodes = [
    ErrorCode.NETWORK_ERROR,
    ErrorCode.REQUEST_TIMEOUT,
    ErrorCode.RATE_LIMITED,
    ErrorCode.TRANSACTION_TIMEOUT,
    ErrorCode.RATE_UPDATE_FAILED,
  ];

  return retryableCodes.includes(code);
}

/**
 * Retry logic with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      const appError = parseError(error);
      if (!isRetryableError(appError)) {
        throw error;
      }

      if (attempt < maxRetries - 1) {
        const delay = delayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Max retries exceeded");
}
