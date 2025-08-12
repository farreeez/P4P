import { AppContext } from "../../contexts/AppContextProvider";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../../api/userApi.js";
import { toast } from "react-toastify";
import styles from "./LoginPage.module.css";

/**
 * User Login page component
 * @constructor
 */
export default function LoginPage() {
	// Navigation
	const navigate = useNavigate();

	// Form Handling
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	// API
	const { loginUser } = User.loginAsync();
	const { login, currentUser } = useContext(AppContext);

	/**
	 * Handle input changes
	 */
	const handleInputChange = e => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	/**
	 * Login in user
	 */
	async function onClick(e) {
		e.preventDefault();
		await authenticateUser();
	}

	/**
	 * Authenticate user.
	 */
	async function authenticateUser() {
		try {
			const loggedInUser = await loginUser(formData);
			login(loggedInUser?.user);

			toast.success(`Welcome back, ${loggedInUser?.user.fullName}!`);
			navigate("/app/chat");
		} catch {
			toast.error("Invalid email or password");
		}
	}


	return (
		<>
			<div className={styles.container}>
				<div className="form-container">
					<div>
						<h2>Welcome back</h2>
						<p>Enter your credentials to sign in to your account</p>
					</div>
					<div style={{ width: "100%" }}>
						<form className="form-contents" onSubmit={onClick}>
							<div className="form-label">
								<label htmlFor="email-item">Email</label>
								<input
									id="email-item"
									type="email"
									name="email"
									value={formData.email}
									onChange={handleInputChange}
									placeholder="name@example.com"
									required
								/>
							</div>
							<div className="form-label">
								<label htmlFor="password-item">Password</label>
								<input
									id="password-item"
									type="password"
									name="password"
									value={formData.password}
									onChange={handleInputChange}
									required
								/>
							</div>
							<div>
								<button
									type="submit"
									className={`button-primary ${styles.signIn}`}
								>
									Sign In
								</button>
							</div>
						</form>
					</div>
					<p className={styles.signupPrompt}>
						Don't have an account?{" "}
						<a href="/register" className={styles.signupLink}>
							Sign up
						</a>
					</p>
				</div>
			</div>
		</>
	);
}
