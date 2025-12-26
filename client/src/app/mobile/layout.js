// Mobile layout for the /mobile route
// This is a Server Component by default and should export a React component
export default function MobileLayout({ children }) {
	return (
		<div className="min-h-screen bg-gray-50">
			{children}
		</div>
	);
}
