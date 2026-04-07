import { b as useNavigate, r as reactExports } from "./index-DuIlzyaK.js";
function OnboardingPage() {
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    void navigate({ to: "/register" });
  }, [navigate]);
  return null;
}
export {
  OnboardingPage as default
};
