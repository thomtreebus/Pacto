module.exports.MESSAGES = {
  FIRST_NAME: {
    BLANK: "First name is a required field",
    CONTAINS_NUMBERS: "First name cannot contain numbers",
    MAX_LENGTH_EXCEEDED: "First name cannot exceed 50 characters"
  },
  LAST_NAME: {
    BLANK: "Last name is a required field",
    CONTAINS_NUMBERS: "Last name cannot contain numbers",
    MAX_LENGTH_EXCEEDED: "Last name cannot exceed 50 characters"
  },
  EMAIL: {
    BLANK: "Email cannot be blank",
    INVALID_FORMAT: "Must be a valid email",
    NOT_UNIQUE: "Email already in use",
    UNI: {
      NON_UNI_EMAIL: "Email must be associated with a supported UK university"
    }
  },
  PASSWORD: {
    GENERIC: "Password does not meet requirements",
    BLANK: "Password cannot be blank",
    MIN_LENGTH_NOT_MET: "Password must be at least 8 characters",
    MAX_LENGTH_EXCEEDED: "Password cannot exceed 64 characters",
    NO_LOWERCASE: "Password must contain at least one lowercase character",
    NO_UPPERCASE: "Password must contain at least one uppercase character",
    NO_NUMBERS: "Password must contain at least one number"
  },
  LOGIN: {
    INVALID_CREDENTIALS: "Invalid credentials",
    INACTIVE_ACCOUNT: "University email not yet verified"
  },
  VERIFICATION: {
    MISSING_CODE: "Code query empty",
    INVALID_CODE: "Invalid or expired code",
    SUCCESS_RESPONSE_WHOLE_BODY: "Success! You may now close this page."
  },
  AUTH_MIDDLEWARE: {
    IS_LOGGED_IN: "User is already authenticated",
    IS_INACTIVE: "User has not verified their university email",
    IS_NOT_LOGGED_IN: "User is not logged in"
  }
}