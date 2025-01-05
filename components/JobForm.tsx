import { useState } from "react";

type JobFormProps = {
  onJobCreated: () => void;
};

export default function JobForm({ onJobCreated }: JobFormProps) {
  const [formData, setFormData] = useState({ title: "", description: "", company: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/offres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      onJobCreated();
      setFormData({ title: "", description: "", company: "" });
    } else {
      alert("Error creating job offer.");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-100 rounded shadow">
      <input
        type="text"
        placeholder="Job Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="mb-4 w-full p-2 border rounded"
      />
      <textarea
        placeholder="Job Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="mb-4 w-full p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Company"
        value={formData.company}
        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        className="mb-4 w-full p-2 border rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Create Job"}
      </button>
    </form>
  );
}
