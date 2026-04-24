import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import PasswordToggleButton from "../components/PasswordToggleButton";
import StatusBanner from "../components/common/StatusBanner";
import { setCredentials } from "../features/auth/authSlice";
import { loginUser, registerUser } from "../services/authService";
import { getDefaultRouteForRole } from "../utils/redirect";

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] },
  }),
};

/* Floating-label input abstraction */
function FloatingInput({ id, type = "text", name, label, value, onChange, required, autoComplete, extra, custom }) {
  return (
    <motion.div variants={fade} custom={custom} initial="hidden" animate="show" className="relative">
      <input
        type={type}
        name={name}
        id={id}
        placeholder=" "
        className="peer w-full border-b border-gray-200 bg-transparent pb-2.5 pt-5 pr-10 text-sm text-[#041e3a] outline-none transition-colors focus:border-[#041e3a]"
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-0 top-5 -translate-y-6 text-[9px] font-bold uppercase tracking-[0.3em] text-gray-300 transition-all
          peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-placeholder-shown:text-gray-400
          peer-focus:-translate-y-6 peer-focus:text-[9px] peer-focus:text-[#041e3a]"
      >
        {label}
      </label>
      {extra}
    </motion.div>
  );
}

function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      const loginResponse = await loginUser({
        email: formData.email,
        password: formData.password,
      });
      dispatch(setCredentials({ token: loginResponse.token, user: loginResponse.user }));
      navigate(getDefaultRouteForRole(loginResponse.user.role));
    } catch (apiError) {
      setError(apiError.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Heading */}
      <motion.div variants={fade} custom={0} initial="hidden" animate="show" className="mb-6">
        <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-gray-300 mb-2">
          Create Profile
        </p>
        <h1 className="font-serif text-3xl text-[#041e3a] leading-tight tracking-wide mb-2">
          Join the brand.
        </h1>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Register for exclusive drops, fast checkout and personalised curation.
        </p>
      </motion.div>

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>

        <FloatingInput
          id="signup-name"
          name="name"
          label="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          autoComplete="name"
          custom={1}
        />

        <FloatingInput
          id="signup-email"
          type="email"
          name="email"
          label="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
          custom={2}
        />

        <FloatingInput
          id="signup-password"
          type={showPassword ? "text" : "password"}
          name="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="new-password"
          custom={3}
          extra={
            <PasswordToggleButton
              visible={showPassword}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-0 top-3 h-8 w-8 border-0 bg-transparent text-gray-300 hover:text-[#041e3a] transition-colors z-10"
            />
          }
        />

        <FloatingInput
          id="signup-confirm-password"
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          autoComplete="new-password"
          custom={4}
          extra={
            <PasswordToggleButton
              visible={showConfirmPassword}
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-0 top-3 h-8 w-8 border-0 bg-transparent text-gray-300 hover:text-[#041e3a] transition-colors z-10"
            />
          }
        />

        {error && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <StatusBanner tone="danger">{error}</StatusBanner>
          </motion.div>
        )}

        {/* Submit */}
        <motion.div variants={fade} custom={5} initial="hidden" animate="show">
          <button
            id="signup-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-[#041e3a] text-white text-[11px] font-bold uppercase tracking-[0.3em] py-4 rounded-none hover:bg-[#041e3a]/85 active:scale-[0.98] transition-all duration-200 disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </motion.div>
      </form>

      {/* Switch to login */}
      <motion.div
        variants={fade} custom={6} initial="hidden" animate="show"
        className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between"
      >
        <span className="text-[12px] text-gray-400">Already have an account?</span>
        <Link
          to="/login"
          className="group inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#041e3a] hover:opacity-60 transition-opacity"
        >
          Sign In
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </motion.div>
    </div>
  );
}

export default Signup;
