import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const HARD_PASSWORD = "password123";
const HARD_EMAIL = "avverma@jobaddah.com";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	function handleSubmit(e) {
		e.preventDefault();
		setError("");
		setLoading(true);
		// Simulate a small delay like a real auth request
		setTimeout(() => {
			setLoading(false);
			if (email === HARD_EMAIL && password === HARD_PASSWORD) {
				// Mark as authenticated (simple client-side flag)
				try {
					localStorage.setItem("adminAuth", "true");
				} catch (err) {
					// ignore storage errors
				}
				// Navigate to /admin if route exists; otherwise stay here
				try {
					navigate("/admin");
				} catch (err) {
					/* no-op */
				}
			} else {
				setError("Invalid email or password.");
			}
		}, 400);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
			<div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
				<h1 className="text-2xl font-semibold mb-4">Admin Login</h1>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">Email</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="admin@example.com"
							required
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-rose-500 focus:border-rose-500 sm:text-sm p-2"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">Password</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="password"
							required
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-rose-500 focus:border-rose-500 sm:text-sm p-2"
						/>
					</div>

					{error && <div className="text-sm text-red-600">{error}</div>}

					<div>
						<button
							type="submit"
							className="w-full inline-flex items-center justify-center rounded-md bg-rose-500 px-4 py-2 text-white hover:bg-rose-600 disabled:opacity-70"
							disabled={loading}
						>
							{loading ? "Signing in..." : "Sign in"}
						</button>
					</div>

					<p className="text-xs text-gray-500">Demo credentials: <span className="font-medium">{HARD_EMAIL}</span> / <span className="font-medium">{HARD_PASSWORD}</span></p>
				</form>
			</div>
		</div>
	);
}
