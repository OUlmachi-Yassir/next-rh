import { useState } from "react";
import ApplyToJobModal from "./ApplyToJobModal";

type JobCardProps = {
  id: string;
  title: string;
  description: string;
  company: string;
};

export default function JobCard({ id, title, description, company }: JobCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-4 border rounded shadow mb-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <p>{description}</p>
      <p className="text-sm text-gray-600">{company}</p>
      <button
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
        onClick={() => setIsModalOpen(true)}
      >
        Apply
      </button>
      {isModalOpen && (
        <ApplyToJobModal
          jobId={id}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
