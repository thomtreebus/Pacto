UNIQUE_MESSAGE = "already in use";

module.exports.UNIQUE_MESSAGE = UNIQUE_MESSAGE;

module.exports.MESSAGES = {
	FIRST_NAME: {
		BLANK: "First name is a required field",
		CONTAINS_NUMBERS: "First name cannot contain numbers",
		MAX_LENGTH_EXCEEDED: "First name cannot exceed 50 characters",
	},
	LAST_NAME: {
		BLANK: "Last name is a required field",
		CONTAINS_NUMBERS: "Last name cannot contain numbers",
		MAX_LENGTH_EXCEEDED: "Last name cannot exceed 50 characters",
	},
	EMAIL: {
		BLANK: "Email cannot be blank",
		INVALID_FORMAT: "Must be a valid email",
		NOT_UNIQUE: `Email ${UNIQUE_MESSAGE}`,
		UNI: {
			NON_UNI_EMAIL: "Email must be associated with a supported UK university",
		},
	},
	PASSWORD: {
		GENERIC: "Password does not meet requirements",
		BLANK: "Password cannot be blank",
		MIN_LENGTH_NOT_MET: "Password must be at least 8 characters",
		MAX_LENGTH_EXCEEDED: "Password cannot exceed 64 characters",
		NO_LOWERCASE: "Password must contain at least one lowercase character",
		NO_UPPERCASE: "Password must contain at least one uppercase character",
		NO_NUMBERS: "Password must contain at least one number",
	},
	LOGIN: {
		INVALID_CREDENTIALS: "Invalid credentials",
		INACTIVE_ACCOUNT: "University email not yet verified",
	},
	VERIFICATION: {
		MISSING_CODE: "Code query empty",
		INVALID_CODE: "Invalid or expired code",
		SUCCESS_RESPONSE_WHOLE_BODY: "Success! You may now close this page.",
	},
	AUTH: {
		IS_LOGGED_IN: "User is already authenticated",
		IS_INACTIVE: "User has not verified their university email",
		IS_NOT_LOGGED_IN: "User is not logged in",
	},
};

module.exports.PACT_MESSAGES = {
	NAME: {
		NOT_UNIQUE: `Name ${UNIQUE_MESSAGE}`,
		MAX_LENGTH_EXCEEDED: "Name cannot exceed 33 characters",
		MIN_LENGTH_NOT_MET: "Name must be at least 2 characters",
		BLANK: "Name is a required field",
	},
	DESCRIPTION: {
		BLANK: "Description is a required field",
		MAX_LENGTH_EXCEEDED: "Description cannot exceed 255 characters",
	},
	UNIVERSITY: {
		BLANK: "University cannot be blank",
	},
	CATEGORY: {
		INVALID_CHOICE:
			"The category must be either society, course, module or other",
		BLANK: "Category is a required field",
	},
	NOT_FOUND: "Pact not found",
	SUCCESSFUL_JOIN: "Successfully Joined the pact",
	NOT_AUTHORISED: "User is not a member of this pact",
	NOT_MODERATOR: "User is not a moderator of this pact",
	SUCCESSFUL_BAN: "User has been banned from pact",
	SUCCESSFUL_REVOKE_BAN: "User no longer banned from pact",
	CANT_BAN: "Can't ban that user from the pact",
	NOT_BANNED: "User is not banned from the pact",
	ALREADY_BANNED: "User is already banned from the pact",
	CANT_BAN_MODERATOR: "Can't ban a moderator from the pact",
	CANT_BAN_NON_MEMBER: "Can't ban someone who is not a member of the pact",
	CANT_PROMOTE_NON_MEMBER: "Can't promote a user that isn't a member of the pact",
	CANT_PROMOTE_MODERATOR: "User is already a moderator of the pact",
	SUCCESSFUL_PROMOTION: "Member has been promoted to moderator",
};

module.exports.POST_MESSAGES = {
  NOT_FOUND: "Post not found",
  NOT_AUTHORISED: {
    NOT_AUTHOR_NOT_MOD: "User is neither a mod nor the author of the post",
    NOT_AUTHOR: "User is not the author of the post"
  }
}

module.exports.COMMENT_MESSAGES = {
  NOT_FOUND: "Comment not found",
  NOT_AUTHORISED: {
    VIEWING: "You are not authorised to view this comment",
    MODIFY: "You are not authorised to modify this comment"
  },
  BLANK: "Comment text is required",
  MAX_LENGTH_EXCEEDED: "Comment text cannot exceed 512 characters",
  REMOVED: "This comment has been removed and locked",
  DELETED_COMMENT_TEXT: "[DATA EXPUNGED]"
}

module.exports.USER_MESSAGES = {
	NOT_AUTHENTICATED: "Post not found",
	DOES_NOT_EXIST: "User does not exist",
	UNIVERSITY_NOT_SET: "User has no university",
	UPDATE_OTHER_PROFILE_UNAUTHORISED: "Can not update someone else's profile",
	SUCCESSFUL_DELETE: "Successfully deleted account!",
	NOT_ACTIVE: "This user is not active"
};