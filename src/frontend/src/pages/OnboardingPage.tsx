import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export default function OnboardingPage() {
  const navigate = useNavigate();
  useEffect(() => {
    void navigate({ to: "/register" });
  }, [navigate]);
  return null;
}
