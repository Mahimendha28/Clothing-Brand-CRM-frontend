import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

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
      setError("Passwords do not match.");
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
      setError(apiError.message || "Signup failed.");
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
    <motion.div 
      className="w-full"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemAnim} className="mb-8 text-center">
         <p className="ui-eyebrow mb-2 opacity-70">Create Profile</p>
         <h2 className="font-serif text-3xl leading-tight text-ink">Join the brand.</h2>
         <p className="mt-3 max-w-sm mx-auto text-xs leading-5 text-secondary transform-gpu">
           Register for access to exclusive streetwear drops and personalized curation.
         </p>
      </motion.div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <motion.div variants={itemAnim} className="relative">
          <input
            type="text"
            name="name"
            id="name"
            placeholder=" "
            className="peer w-full border-b border-line-strong bg-transparent pb-3 pt-5 text-sm text-ink outline-none transition-all focus:border-ink"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <label 
            htmlFor="name"
            className="absolute left-0 top-5 -translate-y-6 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50 transition-all peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-placeholder-shown:text-ink/60 peer-focus:-translate-y-6 peer-focus:text-[10px] peer-focus:text-ink pointer-events-none"
          >
            Full Name
          </label>
        </motion.div>

        <motion.div variants={itemAnim} className="relative">
          <input
            type="email"
            name="email"
            id="email"
            placeholder=" "
            className="peer w-full border-b border-line-strong bg-transparent pb-3 pt-5 text-sm text-ink outline-none transition-all focus:border-ink"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <label 
            htmlFor="email"
            className="absolute left-0 top-5 -translate-y-6 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50 transition-all peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-placeholder-shown:text-ink/60 peer-focus:-translate-y-6 peer-focus:text-[10px] peer-focus:text-ink pointer-events-none"
          >
            Email Address
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
            className="absolute left-0 top-5 -translate-y-6 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50 transition-all peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-placeholder-shown:text-ink/60 peer-focus:-translate-y-6 peer-focus:text-[10px] peer-focus:text-ink pointer-events-none"
          >
            Password
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
            className="absolute left-0 top-5 -translate-y-6 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50 transition-all peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-placeholder-shown:text-ink/60 peer-focus:-translate-y-6 peer-focus:text-[10px] peer-focus:text-ink pointer-events-none"
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
           <motion.div variants={itemAnim} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <StatusBanner tone="danger">{error}</StatusBanner>
           </motion.div>
        )}

        {/* Empty space matching Login 'Forgot password' to retain identical structural height/layout flow if needed, but not necessary if we just match spacing. Let's maintain spacing. */}

        <motion.div variants={itemAnim}>
           <Button type="submit" disabled={loading} className="w-full !mt-4 !rounded-full !py-4 font-semibold uppercase tracking-widest hover:scale-[1.02] transition-transform overflow-hidden relative group">
             <span className="relative z-10 transition-colors group-hover:text-page">{loading ? "Registering..." : "Create Account"}</span>
             <div className="absolute inset-0 bg-ink transform scale-y-0 origin-bottom transition-transform duration-300 group-hover:scale-y-100 z-0"></div>
           </Button>
        </motion.div>
      </form>

      <motion.div variants={itemAnim} className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-line pt-8">
        <span className="text-sm text-secondary">Already hold access?</span>
        <Link to="/login" className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-ink transition hover:opacity-70">
          Sign In <span className="transform transition-transform group-hover:translate-x-2"><ArrowRight className="h-4 w-4" /></span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default Signup;
