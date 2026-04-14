import { startTransition, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Button from "../common/Button";
import EmptyState from "../common/EmptyState";
import StatusBanner from "../common/StatusBanner";
import { createProductReview, getProductReviews } from "../../services/reviewService";
import { getStoredUser, isAuthenticated } from "../../utils/auth";

const formatReviewDate = (value) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));

function ProductReviewsSection({ productId, productName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getStoredUser();
  const canSubmitReview = isAuthenticated() && user?.role === "customer";
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ average_rating: 0, total_reviews: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitNotice, setSubmitNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    rating: 5,
    title: "",
    comment: ""
  });

  useEffect(() => {
    let ignore = false;

    const loadReviews = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getProductReviews(productId);

        if (!ignore) {
          startTransition(() => {
            setReviews(response.reviews || []);
            setSummary(response.summary || { average_rating: 0, total_reviews: 0 });
          });
        }
      } catch (apiError) {
        if (!ignore) {
          setError(apiError.message || "Failed to load product reviews");
          setReviews([]);
          setSummary({ average_rating: 0, total_reviews: 0 });
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      ignore = true;
    };
  }, [productId]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === "rating" ? Number(value) : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated()) {
      navigate("/login", { state: { from: location } });
      return;
    }

    try {
      setSaving(true);
      setSubmitError("");
      setSubmitNotice("");
      const response = await createProductReview(productId, form);
      setSubmitNotice(response.message || `Your review for ${productName} was submitted for approval.`);
      setForm({
        rating: 5,
        title: "",
        comment: ""
      });
    } catch (apiError) {
      setSubmitNotice("");
      setSubmitError(apiError.message || "Failed to submit your review");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6 rounded-[32px] border border-soft bg-canvas p-8 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="ui-eyebrow">Customer Reviews</p>
          <h2 className="mt-3 font-display text-4xl text-ink">Product feedback</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary">
            Approved reviews from delivered orders appear here. Customers can leave a review once their purchase has been completed.
          </p>
        </div>

        <div className="rounded-[22px] bg-page px-5 py-4 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Average rating</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{Number(summary.average_rating || 0).toFixed(1)}</p>
          <p className="mt-2 text-sm text-secondary">{summary.total_reviews || 0} approved review(s)</p>
        </div>
      </div>

      <StatusBanner tone="danger">{error}</StatusBanner>

      {loading ? <p className="text-sm text-secondary">Loading reviews...</p> : null}

      {!loading && !reviews.length ? (
        <EmptyState
          title="No reviews yet"
          description="Delivered customers can leave the first review for this product once their order reaches them."
        />
      ) : null}

      {reviews.length ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-[24px] bg-page p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-ink">{review.title || "Verified customer review"}</p>
                  <p className="mt-2 text-sm text-secondary">
                    {review.customer_name} • {formatReviewDate(review.created_at)}
                  </p>
                </div>

                <div className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-2 text-sm text-ink">
                  <Star className="h-4 w-4 fill-current" />
                  <span>{review.rating}/5</span>
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-secondary">{review.comment}</p>
            </article>
          ))}
        </div>
      ) : null}

      <div className="rounded-[28px] bg-input border border-soft p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="ui-eyebrow">Write a Review</p>
            <h3 className="mt-3 font-display text-3xl text-ink">Share your experience</h3>
          </div>

          {!isAuthenticated() ? (
            <Link
              to="/login"
              state={{ from: location }}
              className="rounded-full border border-line bg-white px-5 py-3 text-sm font-medium text-ink"
            >
              Sign In to Review
            </Link>
          ) : null}
        </div>

        <StatusBanner tone="success">{submitNotice}</StatusBanner>
        <StatusBanner tone="danger">{submitError}</StatusBanner>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-[180px_1fr]">
            <div>
              <label className="ui-label">Rating</label>
              <select
                name="rating"
                value={form.rating}
                onChange={handleInputChange}
                disabled={!canSubmitReview || saving}
                className="ui-input"
              >
                <option value={5}>5 stars</option>
                <option value={4}>4 stars</option>
                <option value={3}>3 stars</option>
                <option value={2}>2 stars</option>
                <option value={1}>1 star</option>
              </select>
            </div>

            <div>
              <label className="ui-label">Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                disabled={!canSubmitReview || saving}
                className="ui-input"
                placeholder="Optional review title"
              />
            </div>
          </div>

          <div>
            <label className="ui-label">Comment</label>
            <textarea
              name="comment"
              rows="5"
              value={form.comment}
              onChange={handleInputChange}
              disabled={!canSubmitReview || saving}
              className="ui-input min-h-[140px] resize-none"
              placeholder={
                canSubmitReview
                  ? "Describe the fit, quality, and how the product felt after delivery."
                  : "Only signed-in customers can submit reviews."
              }
            />
          </div>

          {isAuthenticated() && user?.role !== "customer" ? (
            <p className="text-sm text-secondary">Only customer accounts can submit product reviews.</p>
          ) : null}

          <Button
            type="submit"
            disabled={!canSubmitReview || saving}
            className="!text-sm !font-medium !normal-case !tracking-[0.02em]"
          >
            {saving ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </div>
    </section>
  );
}

export default ProductReviewsSection;
