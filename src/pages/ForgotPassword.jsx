import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import Button from "../components/common/Button";
import StatusBanner from "../components/common/StatusBanner";
import { requestPasswordReset } from "../services/authService";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await requestPasswordReset({ email });
      setSuccessMessage(response.message || "If an account exists, a reset link has been sent.");
    } catch (apiError) {
      setError(apiError.message || "Unable to send reset email.");
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
        <p className="ui-eyebrow mb-2 opacity-70">Password Help</p>
        <h2 className="font-serif text-3xl leading-tight text-ink">Reset access.</h2>
        <p className="mt-3 mx-auto max-w-sm text-xs leading-5 text-secondary">
          Enter your account email and we will send you a secure reset link.
        </p>
      </motion.div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <motion.div variants={itemAnim} className="relative">
          <input
            type="email"
            name="email"
            id="email"
            placeholder=" "
            className="peer w-full border-b border-line-strong bg-transparent pb-3 pt-5 text-sm text-ink outline-none transition-all focus:border-ink"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label
            htmlFor="email"
            className="pointer-events-none absolute left-0 top-5 -translate-y-6 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50 transition-all peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-placeholder-shown:text-ink/60 peer-focus:-translate-y-6 peer-focus:text-[10px] peer-focus:text-ink"
          >
            Email Address
          </label>
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
            disabled={loading}
            className="w-full !rounded-full !py-4 font-semibold uppercase tracking-widest"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </motion.div>
      </form>

      <motion.div variants={itemAnim} className="mt-12 flex items-center justify-between gap-4 border-t border-line pt-8">
        <span className="text-sm text-secondary">Remembered your password?</span>
        <Link
          to="/login"
          className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-ink transition hover:opacity-70"
        >
          Back to Sign In <span className="transform transition-transform group-hover:translate-x-2"><ArrowRight className="h-4 w-4" /></span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default ForgotPassword;
