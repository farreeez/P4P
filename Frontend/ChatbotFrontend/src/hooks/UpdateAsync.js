import { useState } from "react";
import axios from "axios";

/**
 * Updates data on API.
 * @param {string} initialUrl - The API endpoint URL
 * @returns {Object} Object containing data, loading state, error state, and put function
 */
export default function updateAsync(initialUrl = "") {
	const [data, setData] = useState(null);
	const [isLoading, setLoading] = useState(false);
	const [isError, setError] = useState(false);

	const put = async (url = initialUrl, body) => {
		setLoading(true);
		setError(false);

		try {
			const response = await axios.put(url, body);
			setData(response.data);
			return response.data;
		} catch {
			setError(true);
			setLoading(false);
			throw new Error();
		}
	};

	return { data, isLoading, isError, put };
}