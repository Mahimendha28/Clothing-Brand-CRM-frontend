import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import PasswordToggleButton from "../components/PasswordToggleButton";
import Button from "../components/common/Button";
import StatusBanner from "../components/common/StatusBanner";
import { setCredentials } from "../features/auth/authSlice";
import { loginUser } from "../services/authService";
import { getDefaultRouteForRole } from "../utils/redirect";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
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
    setLoading(true);

    try {
      const response = await loginUser(formData);
      dispatch(setCredentials({ token: response.token, user: response.user }));
      navigate(getDefaultRouteForRole(response.user.role));
    } catch (apiError) {
      setError(apiError.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ui-surface">
      <p className="ui-eyebrow">Client Access</p>
      <h2 className="mt-3 font-display text-4xl text-ink md:text-[2.8rem]">Welcome back</h2>
      <p className="mt-3 text-sm leading-6 text-muted">
        Sign in to manage customer relationships, campaign flow, and day-to-day fashion operations.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
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

        <StatusBanner tone="danger">{error}</StatusBanner>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-between gap-4 text-sm text-secondary">
        <span>New to the brand workspace?</span>
        <Link to="/signup" className="inline-flex items-center gap-2 text-accent transition hover:text-ink">
          Create account <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default Login;
