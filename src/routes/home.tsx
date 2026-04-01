import { Sparkles, Briefcase, ArrowRight } from "lucide-react";
import Marquee from "react-fast-marquee";

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { MarqueImg } from "@/components/marquee-img";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="flex-col w-full pb-24">
      <Container>
        {/* ── Hero heading (ORIGINAL – unchanged) ──────────────── */}
        <div className="my-8">
          <h2 className="text-3xl text-center md:text-left md:text-6xl">
            <span className="text-outline font-extrabold md:text-8xl">
              AI Superpower
            </span>
            <span className="text-gray-500 dark:text-gray-400 font-extrabold">
              - A better way to
            </span>
            <br />
            <span className="text-gray-800 dark:text-gray-200">
              improve your interview chances and skills
            </span>
          </h2>

          <p className="mt-4 text-muted-foreground text-sm">
            Boost your interview skills and increase your success rate with
            AI-driven insights. Discover a smarter way to prepare, practice, and
            stand out.
          </p>
        </div>

        {/* ── Stats (ORIGINAL – unchanged) ─────────────────────── */}
        <div className="flex w-full items-center justify-evenly md:px-12 md:py-16 md:items-center md:justify-end gap-12">
          <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 text-center">
            250k+
            <span className="block text-xl text-muted-foreground font-normal">
              Offers Recieved
            </span>
          </p>
          <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 text-center">
            1.2M+
            <span className="block text-xl text-muted-foreground font-normal">
              Interview Aced
            </span>
          </p>
        </div>

        {/* ── Hero image (ORIGINAL – same size/layout) ─────────── */}
        <div className="w-full mt-4 rounded-xl bg-gray-100 dark:bg-gray-800 h-[420px] drop-shadow-md overflow-hidden relative">
          <img
            src="/assets/img/hero.jpg"
            alt=""
            className="w-full h-full object-cover"
          />

          <div className="absolute top-4 left-4 px-4 py-2 rounded-md bg-white/40 dark:bg-black/40 backdrop-blur-md text-gray-900 dark:text-white">
            Inteviews Copilot&copy;
          </div>

          {/* updated card – meaningful copy + link */}
          <div className="hidden md:block absolute w-80 bottom-4 right-4 px-4 py-2 rounded-md bg-white/60 dark:bg-black/60 backdrop-blur-md">
            <h2 className="text-neutral-800 dark:text-white font-semibold">
              AI Mock Interview
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Practice with role-specific questions powered by Gemini AI.
              Record your answers, get instant feedback, and build the
              confidence to ace your next real interview.
            </p>
            <Link to="/generate">
              <Button className="mt-3">
                Take An Interview <Sparkles />
              </Button>
            </Link>
          </div>
        </div>
      </Container>

      {/* ── Marquee (ORIGINAL – unchanged) ──────────────────────── */}
      <div className="w-full my-12">
        <Marquee pauseOnHover>
          <MarqueImg img="/assets/img/logo/firebase.png" />
          <MarqueImg img="/assets/img/logo/meet.png" />
          <MarqueImg img="/assets/img/logo/zoom.png" />
          <MarqueImg img="/assets/img/logo/firebase.png" />
          <MarqueImg img="/assets/img/logo/microsoft.png" />
          <MarqueImg img="/assets/img/logo/meet.png" />
          <MarqueImg img="/assets/img/logo/tailwindcss.png" />
          <MarqueImg img="/assets/img/logo/microsoft.png" />
        </Marquee>
      </div>

      {/* ── Original bottom grid (ORIGINAL – unchanged) ──────────── */}
      <Container className="py-8 space-y-8">
        <h2 className="tracking-wide text-xl text-gray-800 dark:text-gray-200 font-semibold">
          Unleash your potential with personalized AI insights and targeted
          interview practice.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="col-span-1 md:col-span-3">
            <img
              src="/assets/img/office.jpg"
              alt=""
              className="w-full max-h-96 rounded-md object-cover"
            />
          </div>

          <div className="col-span-1 md:col-span-2 gap-8 max-h-96 min-h-96 w-full flex flex-col items-center justify-center text-center">
            <p className="text-center text-muted-foreground">
              Transform the way you prepare, gain confidence, and boost your
              chances of landing your dream job. Let AI be your edge in
              today&apos;s competitive job market.
            </p>

            <Link to={"/generate"} className="w-full">
              <Button className="w-3/4">
                Generate <Sparkles className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </Container>

      {/* ══════════════════════════════════════════════════════════
          NEW ▼  Jobs Section — appended below original content
      ══════════════════════════════════════════════════════════ */}
      <Container className="py-8 space-y-8">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
          <h2 className="tracking-wide text-xl text-gray-800 dark:text-gray-200 font-semibold">
            Find &amp; analyse jobs that match your skills.
          </h2>
          <Link
            to="/jobs"
            className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0"
          >
            View all job tools <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Two image cards — same proportion style as original hero image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Job Finder */}
          <div className="relative rounded-xl overflow-hidden h-[360px] drop-shadow-md group">
            <img
              src="/assets/img/office.jpg"
              alt="Job Finder"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-md bg-white/25 dark:bg-black/40 backdrop-blur-md text-white text-xs font-medium">
              Job Finder
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h3 className="text-white font-semibold text-base mb-1">
                AI-Powered Job Matching
              </h3>
              <p className="text-neutral-300 text-sm leading-relaxed mb-3">
                Upload your resume and describe the role you want. Get matched
                to real jobs with a compatibility score, skill-gap analysis, and
                internship support included.
              </p>
              <Link to="/jobs/finder">
                <Button
                  size="sm"
                  className="bg-emerald-500 hover:bg-emerald-400 text-white gap-2"
                >
                  Find Jobs <Briefcase className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Job Compatibility */}
          <div className="relative rounded-xl overflow-hidden h-[360px] drop-shadow-md group">
            <img
              src="/assets/img/hero.jpg"
              alt="Job Compatibility"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-md bg-white/25 dark:bg-black/40 backdrop-blur-md text-white text-xs font-medium">
              Compatibility Analyser
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h3 className="text-white font-semibold text-base mb-1">
                Deep Job Compatibility Report
              </h3>
              <p className="text-neutral-300 text-sm leading-relaxed mb-3">
                Paste any job description and upload your resume. Get a detailed
                fit score, category breakdown, and a personalised action plan to
                help you land the role.
              </p>
              <Link to="/jobs/compatibility">
                <Button
                  size="sm"
                  className="bg-sky-500 hover:bg-sky-400 text-white gap-2"
                >
                  Check Compatibility <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Feature bullets — two columns matching the two cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              dot: "bg-emerald-500",
              items: [
                "Resume parsing — extracts skills automatically",
                "Match score for each job vs your profile",
                "Highlights missing skills & tech gaps",
                "Supports internships & entry-level roles",
              ],
            },
            {
              dot: "bg-sky-500",
              items: [
                "Overall fit score with category breakdown",
                "Skills you have vs skills required",
                "Actionable improvement roadmap",
                "Company-specific interview tips",
              ],
            },
          ].map((col, ci) => (
            <ul key={ci} className="space-y-2">
              {col.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <span
                    className={`mt-1.5 w-1.5 h-1.5 rounded-full ${col.dot} shrink-0`}
                  />
                  {item}
                </li>
              ))}
            </ul>
          ))}
        </div>

        {/* CTA row */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link to="/jobs" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white">
              Explore All Job Tools <Briefcase className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/generate" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Or Take A Mock Interview <Sparkles className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default HomePage;