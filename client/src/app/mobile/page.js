"use client"
import React, { useState } from 'react'
import MobileHeader from '@/components/mobile/MobileHeader'
import { PrivateHeroSection } from '@/components/mobile/HeroSection'

export default function MobilePage() {
	const [showSearch, setShowSearch] = useState(false)

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Mobile header - passes a toggle to open search UI if needed */}
			<MobileHeader onSearchToggle={() => setShowSearch((s) => !s)} />

			{/* Example: show Private hero below */}
			<PrivateHeroSection categoryCount={12} />

			<main className="px-4 py-6">
				<p className="text-sm text-gray-600">This is the mobile view. Add your lists and components here.</p>
			</main>
		</div>
	)
}
