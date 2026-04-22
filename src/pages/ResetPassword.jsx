import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import PasswordToggleButton from "../components/PasswordToggleButton";
import Button from "../components/common/Button";
import StatusBanner from "../components/common/StatusBanner";
import { resetPassword } from "../services/authService";

const extractResetToken = (value) => {
  const rawValue = String(value || "").trim();

  if (!rawValue) {
    return "";
  }

  try {
    const url = new URL(rawValue);
    const tokenFromQuery = url.searchParams.get("token");

    if (tokenFromQuery) {
      return String(tokenFromQuery).trim();
    }

    const pathnameParts = url.pathname.split("/").filter(Boolean);
    const resetPasswordIndex = pathnameParts.findIndex((segment) => segment === "reset-password");

    if (resetPasswordIndex >= 0 && pathnameParts[resetPasswordIndex + 1]) {
      return String(pathnameParts[resetPasswordIndex + 1]).trim();
    }
  } catch (error) {
    // Treat non-URL input as a raw token.
  }

  return rawValue;
};

function ResetPassword() {
  const { token: routeToken = "" } = useParams();
  const [searchParams] = useSearchParams();
  const initialToken = extractResetToken(searchParams.get("token") || routeToken || "");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValue, setTokenValue] = useState(initialToken);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTokenValue(initialToken);
  }, [initialToken]);

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
    setSuccessMessage("");

    const normalizedToken = extractResetToken(tokenValue);

    if (!normalizedToken) {
      setError("Reset token is missing. Paste the token from your email or open the latest reset link.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword({
        token: normalizedToken,
        password: formData.password
      });
      setSuccessMessage(response.message || "Password reset successfully. You can sign in now.");
      setFormData({
        password: "",
        confirmPassword: ""
      });
    } catch (apiError) {
      setError(apiError.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <motion.div className="w-full" variants={staggerContainer} initial="hidden" animate="show">
      <motion.div variants={itemAnim} className="mb-8 text-center">
        <p className="ui-eyebrow mb-2 opacity-70">New Password</p>
        <h2 className="font-serif text-3xl leading-tight text-ink">Secure your account.</h2>
        <p className="mt-3 mx-auto max-w-sm text-xs leading-5 text-secondary">
          Paste your reset token or use the secure link from your email, then choose a new password.
        </p>
      </motion.div>

      {!tokenValue && (
        <motion.div variants={itemAnim} className="mb-6">
          <StatusBanner tone="danger">Reset token is missing. Paste the token from your email or open the latest password reset link.</StatusBanner>
        </motion.div>
      )}

      <form className="space-y-8" onSubmit={handleSubmit}>
        <motion.div variants={itemAnim} className="relative">
          <input
            type="text"
            name="token"
            id="token"
            placeholder=" "
            className="peer w-full border-b border-line-strong bg-transparent pb-3 pt-5 text-sm text-ink outline-none transition-all focus:border-ink"
            value={tokenValue}
            onChange={(event) => setTokenValue(extractResetToken(event.target.value))}
            required
          />
          <label
            htmlFor="token"
            className="pointer-events-none absolute left-0 top-5 -translate-y-6 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50 transition-all peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-placeholder-shown:text-ink/60 peer-focus:-translate-y-6 peer-focus:text-[10px] peer-focus:text-ink"
          >
            Reset Token
          </label>
        </motion.div>

        <motion.div variants={itemAnim} className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            id="password"
            placeholder=" "
            className="peer w-full border-b border-line-strong bg-transparent pb-3 pt-5 pr-10 text-sm text-ink outline-none transition-all focus:border-ink"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <label
            htmlFor="password"
            className="pointer-events-none absolute left-0 top-5 -translate-y-6 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50 transition-all peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-placeholder-shown:text-ink/60 peer-focus:-translate-y-6 peer-focus:text-[10px] peer-focus:text-ink"
          >
            New Password
          </label>
          <PasswordToggleButton
            visible={showPassword}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-0 top-3 h-8 w-8 border-0 bg-transparent text-secondary hover:text-ink transition-colors z-10"
          />
        </motion.div>

        <motion.div variants={itemAnim} className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            id="confirmPassword"
            placeholder=" "
            className="peer w-full border-b border-line-strong bg-transparent pb-3 pt-5 pr-10 text-sm text-ink outline-none transition-all focus:border-ink"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <label
            htmlFor="confirmPassword"
            className="pointer-events-none absolute left-0 top-5 -translate-y-6 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50 transition-all peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-placeholder-shown:text-ink/60 peer-focus:-translate-y-6 peer-focus:text-[10px] peer-focus:text-ink"
          >
            Confirm Password
          </label>
          <PasswordToggleButton
            visible={showConfirmPassword}
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-0 top-3 h-8 w-8 border-0 bg-transparent text-secondary hover:text-ink transition-colors z-10"
          />
        </motion.div>

        {error && (
          <motion.div variants={itemAnim}>
            <StatusBanner tone="danger">{error}</StatusBanner>
          </motion.div>
        )}

        {successMessage && (
          <motion.div variants={itemAnim}>
            <StatusBanner tone="success">{successMessage}</StatusBanner>
          </motion.div>
        )}

        <motion.div variants={itemAnim}>
          <Button
            type="submit"
            disabled={loading || !String(tokenValue || "").trim()}
            className="w-full !rounded-full !py-4 font-semibold uppercase tracking-widest"
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </motion.div>
      </form>

      <motion.div variants={itemAnim} className="mt-12 flex items-center justify-between gap-4 border-t border-line pt-8">
        <span className="text-sm text-secondary">Ready to continue?</span>
        <Link
          to="/login"
          className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-ink transition hover:opacity-70"
        >
          Sign In <span className="transform transition-transform group-hover:translate-x-2"><ArrowRight className="h-4 w-4" /></span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default ResetPassword;
