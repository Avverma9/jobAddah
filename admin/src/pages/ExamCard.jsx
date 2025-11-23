import { GraduationCap } from "lucide-react";
import React, { useEffect } from "react";
import { WidgetCard, WidgetLink } from "./WidgetCard";
import { useDispatch } from "react-redux";
import { getExams } from "../../redux/slices/job";

export default function ExamCard() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getExams());
  }, [dispatch]);
  return (
    <div>
      {" "}
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
    </div>
  );
}
