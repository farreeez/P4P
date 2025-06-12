import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../../api/userApi.js";
import { AppContext } from "../../contexts/AppContextProvider.jsx";
import { toast } from "react-toastify";
import styles from "./RegisterPage.module.css";

/**
 * User Registration page component
 * @constructor
 */
export default function RegisterPage() {
	// Navigation
	const navigate = useNavigate();

	// Form Handling
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	// API
	const { createUser } = User.createAsync();
	const { login } = useContext(AppContext);

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
	 * Handle account creation
	 */
	async function handleSignup(e) {
		e.preventDefault();

		if (formData.password !== formData.confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		await registerUser();
	}

	/**
	 * Register a new user.
	 */
	async function registerUser() {
		const newUser = {
			fullName: formData.fullName,
			email: formData.email,
			password: formData.password,
		};

		try {
			const user = await createUser(newUser);
			login(user);
			toast.success(`Welcome, ${user.fullName}!`); //
			navigate("/");
		} catch (error) {
			toast.error(error);
		}
	}

	/**
	 * Return to landing page.
	 */
	function onBack() {
		navigate("/");
	}

	return (
		<>
			<button
				className={`button-secondary ${styles.backButton}`}
				onClick={onBack}
			>
				Go Back
			</button>
			<div className={styles.container}>
				<div className="form-container">
					<div>
						<h2>Create an account</h2>
						<p>Enter your information to get started</p>
					</div>

					<div style={{ width: "100%" }}>
						<form className="form-contents" onSubmit={handleSignup}>
							<div className="form-label">
								<label
									className="form-label"
									htmlFor="fullname"
								>
									Name
								</label>
								<input
									id="fullname"
									type="text"
									name="fullName"
									value={formData.fullName}
									onChange={handleInputChange}
									placeholder="Firstname Lastname"
									required
								/>
							</div>

							<div className="form-label">
								<label htmlFor="email">Email</label>
								<input
									id="email"
									type="email"
									name="email"
									value={formData.email}
									onChange={handleInputChange}
									placeholder="name@example.com"
									required
								/>
							</div>

							<div className="form-label">
								<label htmlFor="password">Password</label>
								<input
									id="password"
									type="password"
									name="password"
									value={formData.password}
									onChange={handleInputChange}
									required
								/>
							</div>

							<div className="form-label">
								<label htmlFor="confirm-password">
									Confirm Password
								</label>
								<input
									id="confirm-password"
									type="password"
									name="confirmPassword"
									value={formData.confirmPassword}
									onChange={handleInputChange}
									required
								/>
							</div>

							<button type="submit" className="button-primary">
								Create Account
							</button>
						</form>

						<p className={styles.loginPrompt}>
							Already have an account?{" "}
							<a href="/login" className="loginLink">
								Sign in
							</a>
						</p>
					</div>
				</div>
			</div>
		</>
	);
}
