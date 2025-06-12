import createAsync from "../hooks/createAsync.js";
import getAsync from "../hooks/getAsync.js";
import updateAsync from "../hooks/updateAsync.js";
import deleteAsync from "../hooks/deleteAsync.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const API_USER_URL = `${API_BASE_URL}/api/user`;

/**
 * User API class.
 */
export class User {
	/**
	 * Creates a new user.
	 */
	static createAsync() {
		const { data, isLoading, isError, post } = createAsync();

		/**
		 * Creates a new user.
		 */
		async function createUser(user) {
			const createdUser = await post(API_USER_URL, user);
			return createdUser;
		}

		return { createUser, isLoading, isError, data };
	}

	/**
	 * Gets all users.
	 */
	static getAsync() {
		const { data, isLoading, isError, fetch } = getAsync();

		/**
		 * Gets all users.
		 */
		async function getUsers() {
			const users = await fetch(API_USER_URL);
			return users ?? [];
		}

		return { getUsers, data, isLoading, isError };
	}

	/**
	 * Gets a user by ID.
	 * @param userId
	 */
	static getUserByIdAsync() {
		const { data, isLoading, isError, fetch } = getAsync();

		const getUser = async userId => {
			const user = await fetch(API_USER_URL + `/${userId}`);
			return user ?? null;
		};

		return { getUser, data, isLoading, isError };
	}

	/**
	 * Gets a user by full name.
	 * @param fullName
	 */
	static getUserByFullNameAsync(fullName) {
		const { data, isLoading, isError, fetch } = getAsync(
			API_USER_URL + `/name/${encodeURIComponent(fullName)}`,
		);

		const getUser = async () => {
			try {
				const user = await fetch();
				return user ?? null;
			} catch (error) {
				console.error("Error fetching user:", error);
				return null;
			}
		};

		return { getUser, data, isLoading, isError };
	}

	/**
	 * Matches users to partial name.
	 */
	static searchUsersAsync() {
		const { data, isLoading, isError, fetch } = getAsync();

		/**
		 * Matches users to partial name.
		 */
		async function searchUsers(searchString) {
			const users = await fetch(
				API_USER_URL +
					`/userSearch/${encodeURIComponent(searchString)}`,
			);
			return users ?? [];
		}

		return { searchUsers, data, isLoading, isError };
	}

	/**
	 * Updates a user by ID.
	 */
	static updateAsync() {
		const { data, isLoading, isError, put } = updateAsync();

		/**
		 * Updates a user with the given ID and data.
		 */
		async function updateUser(userId, userData) {
			const updatedUser = await put(
				`${API_USER_URL}/${userId}/details`,
				userData,
			);
			return updatedUser;
		}

		return { updateUser, data, isLoading, isError };
	}

	/**
	 * Deletes a user by ID.
	 */
	static deleteAsync() {
		const { data, isLoading, isError, remove } = deleteAsync();

		/**
		 * Deletes a user with the given ID.
		 */
		async function deleteUser(userId) {
			await remove(`${API_USER_URL}/${userId}`);
		}

		return { deleteUser, data, isLoading, isError };
	}

	/**
	 * Authenticates a user.
	 */
	static loginAsync() {
		const { data, isLoading, isError, post } = createAsync();

		/**
		 * Logs in a user.
		 */
		async function loginUser(entity) {
			const user = await post(API_USER_URL + "/authenticate", entity);
			return user ?? null;
		}

		return { loginUser, data, isLoading, isError };
	}
}
