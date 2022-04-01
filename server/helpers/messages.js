/**
 * Message to tell that something is already in use.
 * Used by the errorHandler.
 */
UNIQUE_MESSAGE = "already in use";
module.exports.UNIQUE_MESSAGE = UNIQUE_MESSAGE;

/**
 * General error messages concerning fields of users,
 * passwords, login, verification and authentication.
 */
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

/**
 * Error messages about pacts.
 */
module.exports.PACT_MESSAGES = {
	IS_BANNED_USER: "You have been banned from this pact cannot join!",
	NAME: {
		NOT_UNIQUE: `Name ${UNIQUE_MESSAGE}`,
		MAX_LENGTH_EXCEEDED: "Name cannot exceed 50 characters",
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
	LEAVE: {
		SUCCESSFUL: "Successfully left the pact",
		ALONE: "You are alone in the pact, so you must delete it to leave",
		ONLY_MODERATOR: "You are the only moderator, make at least one new moderator to be able to leave",
	},
	DELETE: {
		SUCCESSFUL: "Successfully deleted the pact",
		TOO_MANY_MODERATORS: "You cannot delete a pact if you are not the only moderator of it",
	},
};

/**
 * Error messages about posts.
 */
module.exports.POST_MESSAGES = {
	NOT_FOUND: "Post not found",
	NOT_AUTHORISED: {
		NOT_AUTHOR_NOT_MOD: "User is neither a mod nor the author of the post",
		NOT_AUTHOR: "User is not the author of the post",
	},
	NO_AUTHOR: "Author is a required field",
  NO_PACT: "Post is a required field",
  TITLE: {
		BLANK: "Title is a required field",
		MAX_LENGTH_EXCEEDED: "Title cannot exceed 200 characters",
	},
  TYPE: {
    BLANK: "Type is a required field",
    INVALID: "Type must be either link, image or text",
	IMAGE: {
		BLANK: "Image is a required field"
	},
	TEXT: {
		BLANK: "Text is a required field",
		MAX_LENGTH_EXCEEDED: "Text cannot exceed 3000 characters",
	},
	LINK: {
		BLANK: "Link is a required field",
		INVALID: "The provided HTTP URL is invalid"
	}
  },
  NO_VOTES: "Votes is a required field",
  NO_UPVOTERS: "Upvoters is a required field",
  NO_DOWNVOTERS: "Downvoters is a required field",
  NOT_FOUND: "Post not found",
  NOT_AUTHORISED: {
    NOT_AUTHOR_NOT_MOD: "User is neither a mod nor the author of the post",
    NOT_AUTHOR: "User is not the author of the post"
  }
};

module.exports.NOTIFICATION_MESSAGES = {
	NOT_FOUND: "No notifications found",
	ALREADY_READ: "Notification has already been marked as read",
	OTHER_USER: "Can not mark a notification as read for another user"
}

/**
 * Error messages about friends.
 */
module.exports.FRIEND_MESSAGES = {
	NOT_FOUND: "The user is not found",
	NOT_FRIEND: "The user exists but is not a friend",
	ALREADY_FRIEND: "The user is already a friend",
	REQUEST: {
		NOT_FOUND: "Friend request not found",
		NOT_AUTHORISED: {
			ACCEPT: "Cannot accept friend request for somebody else",
			REJECT: "Cannot reject friend request for somebody else",
		},
		ALREADY: {
			SENT: "Friend request already sent to this person",
			RECEIVED: "Already received a friend request from this person"
		},
		SELF: "Cannot send friend request to yourself"
	}
};

/**
 * Error messages about comments.
 */
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

/**
 * Error messages about users.
 */
module.exports.USER_MESSAGES = {
	NOT_AUTHENTICATED: "Post not found",
	DOES_NOT_EXIST: "User does not exist",
	UNIVERSITY_NOT_SET: "User has no university",
	UPDATE_OTHER_PROFILE_UNAUTHORISED: "Can not update someone else's profile",
	SUCCESSFUL_DELETE: "Successfully deleted account!",
	NOT_ACTIVE: "This user is not active"
};
