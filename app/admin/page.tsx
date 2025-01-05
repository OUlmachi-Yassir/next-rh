"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import jwtDecode from "jsonwebtoken";
import JobForm from "@/components/JobForm";

interface Job {
  _id: string;
  title: string;
  description: string;
  company: string;
}

interface Application {
  id: string;
  fullName: string;
  email: string;
  cvPath: string;
}


export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode.decode(token) as { role: string };
      if (decodedToken && decodedToken.role === "admin") {
        router.push("/admin");
      } else if (decodedToken && decodedToken.role === "costumer") {
        router.push("/offres");
      } else {
        alert("Invalid token format or role not found.");
      }
    }
  }, [router]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/offres");
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data: Job[] = await res.json();
        setJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchJobs();
  }, []);

  const fetchApplications = async (jobId: string) => {
    setLoadingApplications(true);
    try {
      const res = await fetch(`/api/jobs/apply/${jobId}`);
      if (!res.ok) throw new Error("Failed to fetch applications");
      const data: Application[] = await res.json();
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleJobClick = (jobId: string) => {
    setSelectedJobId(jobId);
    fetchApplications(jobId);
  };

  const handleJobCreated = () => {
    console.log("Job created successfully!");
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

        <div className="p-8">
              <h1 className="text-2xl mb-4">Admin Dashboard</h1>
              <button
                onClick={() => setShowForm(!showForm)}
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
              >
                {showForm ? "Close Form" : "Create Job"}
              </button>
        
              {showForm && <JobForm onJobCreated={handleJobCreated} />}
            </div>

        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Job Offers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job._id}
              onClick={() => handleJobClick(job._id)}
              className="bg-white border shadow-md rounded-lg p-6 cursor-pointer hover:bg-blue-50 hover:shadow-xl transition duration-300"
            >
              <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{job.description}</p>
              <p className="mt-4 text-blue-600 font-medium">Company: {job.company}</p>
            </div>
          ))}
        </div>

        {selectedJobId && (
          <div className="mt-8 p-6 bg-gray-50 border rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Applications for Job ID: <span className="text-blue-600">{selectedJobId}</span>
            </h2>
            {loadingApplications ? (
              <div className="text-center py-4">
                <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600"></div>
                <p className="mt-2 text-gray-700">Loading applications...</p>
              </div>
            ) : applications.length > 0 ? (
              <ul className="space-y-4">
                {applications.map((app) => (
                  <li
                    key={app.id}
                    className="p-4 bg-white border rounded-lg shadow hover:bg-blue-50 transition duration-300"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <strong className="text-gray-800">{app.fullName}</strong>{" "}
                        <span className="text-sm text-gray-600">({app.email})</span>
                      </div>
                      <a
                        href={app.cvPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        View CV
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700">No applications found for this job.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
