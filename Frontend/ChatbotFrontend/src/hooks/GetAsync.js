import { useState } from "react";
import axios from "axios";

/**
 * Fetches data from API.
 * @param {string} initialUrl - The API endpoint URL
 * @returns {Object} Object containing data, loading state, error state, and fetch function
 */
export default function getAsync(initialUrl = "") {
	const [data, setData] = useState(null);
	const [isLoading, setLoading] = useState(false);
	const [isError, setError] = useState(false);

	const fetch = async (url = initialUrl) => {
		setLoading(true);
		setError(false);

		try {
			const response = await axios.get(url);
			setData(response.data);
			return response.data;
		} catch {
			setError(true);
			setLoading(false);
			throw new Error();
		}
	};

	return { data, isLoading, isError, fetch };
}