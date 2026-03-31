import { Link } from "react-router-dom";
import { Briefcase, BarChart2, ArrowRight } from "lucide-react";
import { Headings } from "@/components/headings";
import { Separator } from "@/components/ui/separator";

export const JobsPage = () => {
  return (
    <div className="flex flex-col w-full gap-8 py-8">
      <div>
        <Headings
          title="Jobs"
          description="Find jobs that match your skills or analyse how well you fit a specific role."
        />
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        {/* Job Finder card */}
        <Link to="/jobs/finder" className="group">
          <div className="flex flex-col gap-4 p-6 rounded-xl border bg-card hover:shadow-md hover:border-emerald-300 transition-all duration-200 h-full">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-200">
              <Briefcase className="w-6 h-6 text-emerald-600" />
            </div>

            <div className="flex-1 space-y-2">
              <h2 className="text-xl font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">
                Job Finder
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upload your resume and describe the kind of role you are looking
                for. We will search for relevant jobs and show you how well your
                tech stack and experience match each one — including internships.
              </p>
            </div>

            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {[
                "Resume parsing — extracts skills and experience automatically",
                "Match score for each job against your profile",
                "Highlights missing skills and tech gaps",
                "Supports internships and entry-level roles",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-1 text-sm font-medium text-emerald-600 mt-2">
              Find Jobs <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>

        {/* Job Compatibility card */}
        <Link to="/jobs/compatibility" className="group">
          <div className="flex flex-col gap-4 p-6 rounded-xl border bg-card hover:shadow-md hover:border-sky-300 transition-all duration-200 h-full">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-sky-50 border border-sky-200">
              <BarChart2 className="w-6 h-6 text-sky-600" />
            </div>

            <div className="flex-1 space-y-2">
              <h2 className="text-xl font-semibold text-gray-800 group-hover:text-sky-600 transition-colors">
                Job Compatibility
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Paste a specific job description and the company name, then
                upload your resume. Get a detailed analytics breakdown of how
                good a fit you are, what skills to improve, and a personalised
                action plan to land the role.
              </p>
            </div>

            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {[
                "Overall fit score with category breakdown",
                "Skills you already have vs skills required",
                "Actionable improvement roadmap",
                "Company-specific insight from the job description",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-1 text-sm font-medium text-sky-600 mt-2">
              Check Compatibility <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};