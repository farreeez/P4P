import { useState } from "react";
import axios from "axios";

/**
 * Posts data to API.
 * @param initialUrl
 * @returns {{data: unknown, isLoading: boolean, isError: boolean, post: ((function(*): Promise<any|undefined>)|*)}}
 */
export default function createAsync(initialUrl = "") {
	const [data, setData] = useState(null);
	const [isLoading, setLoading] = useState(false);
	const [isError, setError] = useState(false);

  const post = async (url = initialUrl, body, config = {}) => {
		setLoading(true);
		setError(false);

		try {
			const response = await axios.post(url, body, config);
			setData(response.data);
			setLoading(false);
			return response.data;
		} catch (error) {
			setError(true);
			setLoading(false);
			throw (
				error.response?.data?.message || "An unexpected error occurred"
			);
		}
	};

	return { data, isLoading, isError, post };
}
