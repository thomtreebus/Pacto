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
    INVALID_FORMAT: "Email must be formatted correctly",
    UNI: {
      NON_UNI_EMAIL: "Email must be associated with a supported UK university"
    }
  },
  PASSWORD: {
    BLANK: "Password cannot be blank",
    MIN_LENGTH_NOT_MET: "Password must be at least 8 characters",
    MAX_LENGTH_EXCEEDED: "Password cannot exceed 64 characters",
    NO_LOWERCASE: "Password must contain at least one lowercase character",
    NO_UPPERCASE: "Password must contain at least one uppercase character",
    NO_NUMBERS: "Password must contain at least one number"
  }
}