import { useState } from "react";
import { api } from "../lib/api";

export default function NewReviewPage() {
  const [trackId, setTrackId] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const resp = await api.createTrackReview(trackId, rating, text);
    setMessage(resp.msg || "");
    if (resp.code === 0) {
      setText("");
    }
  };

  return (
    <section>
      <h1>New Review</h1>
      {message && <p className="error-text">{message}</p>}
      <form className="card form-grid" onSubmit={submitReview}>
        <label>
          Track ID
          <input
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            placeholder="Enter Apple track ID, e.g. 1654369917"
            required
          />
        </label>
        <label>
          Rating (1-5)
          <input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            placeholder="1 to 5"
          />
        </label>
        <label>
          Review Text
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your review"
            required
          />
        </label>
        <button type="submit">Create Review</button>
      </form>
    </section>
  );
}
