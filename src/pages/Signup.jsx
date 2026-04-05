import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import PasswordToggleButton from "../components/PasswordToggleButton";
import Button from "../components/common/Button";
import StatusBanner from "../components/common/StatusBanner";
import { setCredentials } from "../features/auth/authSlice";
import { loginUser, registerUser } from "../services/authService";
import { getDefaultRouteForRole } from "../utils/redirect";

function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      const loginResponse = await loginUser({
        email: formData.email,
        password: formData.password
      });

      dispatch(setCredentials({ token: loginResponse.token, user: loginResponse.user }));
      navigate(getDefaultRouteForRole(loginResponse.user.role));
    } catch (apiError) {
      setError(apiError.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ui-surface">
      <p className="ui-eyebrow">Create Account</p>
      <h2 className="mt-3 font-display text-4xl text-ink md:text-[2.8rem]">Join the brand</h2>
      <p className="mt-3 text-sm leading-6 text-muted">
        Start with a customer account and enter the brand workspace in a few steps.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="ui-label">Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            className="ui-input mt-2"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="ui-label">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            className="ui-input mt-2"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="ui-label">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create your password"
              className="ui-input mt-2 pr-14"
              value={formData.password}
              onChange={handleChange}
            />
            <PasswordToggleButton
              visible={showPassword}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-[calc(50%+6px)] h-9 w-9 -translate-y-1/2 border-0 bg-transparent text-secondary"
            />
          </div>
        </div>

        <div>
          <label className="ui-label">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm your password"
              className="ui-input mt-2 pr-14"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <PasswordToggleButton
              visible={showConfirmPassword}
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-2 top-[calc(50%+6px)] h-9 w-9 -translate-y-1/2 border-0 bg-transparent text-secondary"
            />
          </div>
        </div>

        <StatusBanner tone="danger">{error}</StatusBanner>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between gap-4 text-sm text-secondary">
        <span>Already have access?</span>
        <Link to="/login" className="inline-flex items-center gap-2 text-accent transition hover:text-ink">
          Sign in <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default Signup;
