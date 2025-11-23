import React from 'react'

export default function AdmitCard() {
  return (
    <WidgetCard
            title="Admission"
            icon={<GraduationCap size={18} />}
            color="text-orange-600"
          >
            <ul className="space-y-3">
              <WidgetLink text="BHU UG Admission 2025 Open" isNew />
              <WidgetLink text="NTA NEET UG 2025 Form" />
              <WidgetLink text="Simultala Awasiya Vidyalaya Form" />
            </ul>
          </WidgetCard>
  )
}
