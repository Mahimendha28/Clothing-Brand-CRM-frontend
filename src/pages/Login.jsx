import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";

import PasswordToggleButton from "../components/PasswordToggleButton";
import StatusBanner from "../components/common/StatusBanner";
import { setCredentials } from "../features/auth/authSlice";
import { loginUser } from "../services/authService";
import { getDefaultRouteForRole } from "../utils/redirect";

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] },
  }),
};

function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await loginUser(formData);
      dispatch(setCredentials({ token: response.token, user: response.user }));
      const redirectTarget = location.state?.from
        ? `${location.state.from.pathname}${location.state.from.search || ""}`
        : getDefaultRouteForRole(response.user.role);
      navigate(redirectTarget, { replace: true });
    } catch (apiError) {
      setError(apiError.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
<<<<<<< HEAD
      {/* Heading */}
      <motion.div variants={fade} custom={0} initial="hidden" animate="show" className="mb-7">
        <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-gray-300 mb-2">
          Welcome back
        </p>
        <h1 className="font-serif text-3xl text-[#041e3a] leading-tight tracking-wide mb-2">
          Sign in to your account.
        </h1>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Access your orders, wishlist and exclusive drops.
        </p>
      </motion.div>

      {/* Form */}
      <form className="space-y-5" onSubmit={handleSubmit}>

        <motion.div variants={fade} custom={1} initial="hidden" animate="show" className="relative">
          <input
            type="email"
            name="email"
            id="login-email"
            placeholder=" "
            className="peer w-full border-b border-gray-200 bg-transparent pb-2.5 pt-5 text-sm text-[#041e3a] outline-none transition-colors focus:border-[#041e3a]"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
          <label
            htmlFor="login-email"
            className="pointer-events-none absolute left-0 top-5 -translate-y-6 text-[9px] font-bold uppercase tracking-[0.3em] text-gray-300 transition-all
              peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-placeholder-shown:text-gray-400
              peer-focus:-translate-y-6 peer-focus:text-[9px] peer-focus:text-[#041e3a]"
          >
            Email Address
          </label>
        </motion.div>

        <motion.div variants={fade} custom={2} initial="hidden" animate="show" className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            id="login-password"
            placeholder=" "
            className="peer w-full border-b border-gray-200 bg-transparent pb-2.5 pt-5 pr-10 text-sm text-[#041e3a] outline-none transition-colors focus:border-[#041e3a]"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
          <label
            htmlFor="login-password"
            className="pointer-events-none absolute left-0 top-5 -translate-y-6 text-[9px] font-bold uppercase tracking-[0.3em] text-gray-300 transition-all
              peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-placeholder-shown:text-gray-400
              peer-focus:-translate-y-6 peer-focus:text-[9px] peer-focus:text-[#041e3a]"
          >
            Password
          </label>
          <PasswordToggleButton
            visible={showPassword}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-0 top-3 h-8 w-8 border-0 bg-transparent text-gray-300 hover:text-[#041e3a] transition-colors z-10"
          />
        </motion.div>

        {/* Forgot password */}
        <motion.div variants={fade} custom={3} initial="hidden" animate="show" className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-[#041e3a] transition-colors"
          >
            Forgot password?
          </Link>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <StatusBanner tone="danger">{error}</StatusBanner>
          </motion.div>
        )}

        {/* Submit */}
        <motion.div variants={fade} custom={4} initial="hidden" animate="show">
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-[#041e3a] text-white text-[11px] font-bold uppercase tracking-[0.3em] py-4 rounded-none hover:bg-[#041e3a]/85 active:scale-[0.98] transition-all duration-200 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </motion.div>
      </form>

      {/* Switch to signup */}
      <motion.div
        variants={fade} custom={5} initial="hidden" animate="show"
        className="mt-7 pt-6 border-t border-gray-100 flex items-center justify-between"
      >
        <span className="text-[12px] text-gray-400">New to the brand?</span>
        <Link
          to="/signup"
          className="group inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#041e3a] hover:opacity-60 transition-opacity"
        >
          Create Account
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </motion.div>
=======
      <div className="mb-10">
         <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Welcome Back</h2>
         <p className="text-gray-400 text-sm font-medium tracking-wide">
            Manage your orders, wishlist, and recommendations.
         </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-1">
           <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Email Address</label>
           <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors">
                 <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                placeholder="YOUR NAME @ EMAIL.COM"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all"
                value={formData.email}
                onChange={handleChange}
                required
              />
           </div>
        </div>

        <div className="space-y-1">
           <div className="flex justify-between items-end mb-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Password</label>
              <Link to="/forgot-password" size="xs" className="text-[9px] font-black uppercase tracking-widest text-[var(--color-primary)]">Forgot?</Link>
           </div>
           <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors">
                 <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-12 text-xs font-bold uppercase tracking-widest outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <PasswordToggleButton
                visible={showPassword}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
              />
           </div>
        </div>

        {error && <StatusBanner tone="danger">{error}</StatusBanner>}

        <button 
          type="submit" 
          disabled={loading} 
          className="btn-primary w-full py-4 rounded-xl shadow-[0_10px_20px_rgba(255,63,108,0.2)]"
        >
          {loading ? "AUTHENTICATING..." : "SIGN IN"}
        </button>
      </form>

      <div className="mt-12 pt-8 border-t border-gray-100 text-center">
         <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">New to Badshah?</p>
         <Link to="/signup" className="group flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-black hover:text-[var(--color-primary)] transition-all">
            Create an Account
            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
         </Link>
      </div>
>>>>>>> 1de91db6071b7668a3db0c1e9aa694ca24f4e776
    </div>
  );
}

export default Login;
