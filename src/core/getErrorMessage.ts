export const getErrorMessage = (maybeError: unknown): string => {
	if (
		typeof maybeError === "object" &&
		maybeError !== null &&
		"message" in maybeError &&
		typeof maybeError.message === "string"
	) {
		return maybeError.message;
	}

	return "Unknown error";
};
