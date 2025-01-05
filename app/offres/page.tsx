"use client"

import { useEffect, useState } from "react";
import JobCard from "@/components/JobCard";

type Job = {
 _id: number;
  title: string;
  description: string;
  company: string;
};

export default function Offres() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      const res = await fetch("/api/offres");
      const data = await res.json();
      console.log("Fetched jobs:", data);
      setJobs(data);
    };

    fetchJobs();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Job Offers</h1>
      {jobs.map((job) => (
        <JobCard
          key={job._id}
          id={String(job._id)}
          title={job.title}
          description={job.description}
          company={job.company}
        />
        
      ))}
    </div>
  );
}
