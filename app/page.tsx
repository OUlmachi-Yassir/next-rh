'use client'; 
import { useEffect, useState } from "react";
import Link from "next/link";
import JobCard from "@/components/JobCard";


type Job = {
    id: number;
    title: string;
    description: string;
    company: string;
  };

const IndexPage = () => {
  const [isAuth, setIsAuth] = useState<boolean>(false);

  const [jobs, setJobs] = useState<Job[]>([]);
  
    useEffect(() => {
      const fetchJobs = async () => {
        const res = await fetch("/api/offres");
        const data = await res.json();
        setJobs(data);
      };
  
      fetchJobs();
    }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuth(!!token); 
  }, []);

  return (
    <main className="">
      <div className="p-8 bg-white shadow-md rounded-lg">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">
          Welcome to Our Application
        </h1>
        {isAuth ? (
          <div className="text-center">
            <p className="mb-4">You are logged in.</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-4">You are not logged in.</p>
            <div>
              <Link href="/login" className="text-blue-600 hover:underline mr-4">
                Login
              </Link>
              <Link href="/signup" className="text-blue-600 hover:underline">
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>

        {jobs.map((job) => (
                <JobCard
                key={job.id}
                id={String(job.id)}
                title={job.title}
                description={job.description}
                company={job.company}
                />
            ))}
    </main>
  );
};

export default IndexPage;
