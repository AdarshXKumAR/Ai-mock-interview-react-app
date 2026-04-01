import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Loader,
  Upload,
  X,
  BarChart2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  ExternalLink,
  Building2,
  Sparkles,
  BookOpen,
  Star,
  MapPin,
  Clock,
} from "lucide-react";

import { CustomBreadCrumb } from "@/components/custom-bread-crumb";
import { Headings } from "@/components/headings";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { chatSession } from "@/scripts";
import {
  extractTextFromDocument,
  validateResumeFile,
} from "@/lib/resume-extractor";

// LinkedIn SVG logo
const LinkedInLogo = () => (
  <svg
    className="w-4 h-4 shrink-0"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const formSchema = z.object({
  jobTitle: z.string().min(2, "Job title is required"),
  company: z.string().min(1, "Company name is required"),
  jobDescription: z
    .string()
    .min(50, "Please paste the full job description (at least 50 characters)"),
});

type FormData = z.infer<typeof formSchema>;

interface CategoryScore {
  category: string;
  score: number;
  notes: string;
}

interface Improvement {
  skill: string;
  priority: "high" | "medium" | "low";
  suggestion: string;
  resource?: string;
}

interface SimilarJob {
  title: string;
  company: string;
  location: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceRequired: string;
  jobType: string;
  salary: string;
  whyGoodFit: string;
}

interface CompatibilityResult {
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  categoryScores: CategoryScore[];
  improvements: Improvement[];
  actionPlan: string[];
  verdict: string;
  interviewTips: string[];
  similarJobs: SimilarJob[];
}

const priorityColors: Record<string, string> = {
  high: "text-red-600 bg-red-50 border-red-200",
  medium: "text-amber-600 bg-amber-50 border-amber-200",
  low: "text-emerald-600 bg-emerald-50 border-emerald-200",
};

const scoreToColor = (score: number) => {
  if (score >= 75) return "text-emerald-600";
  if (score >= 50) return "text-amber-500";
  return "text-red-500";
};

const scoreToBarColor = (score: number) => {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-400";
  return "bg-red-400";
};

const scoreCardColor = (score: number) => {
  if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-500 bg-red-50 border-red-200";
};

const scoreBarCardColor = (score: number) => {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-400";
  return "bg-red-400";
};

const jobTypeColor = (type: string) => {
  const t = (type || "").toLowerCase();
  if (t.includes("intern")) return "bg-purple-50 text-purple-700 border-purple-200";
  if (t.includes("remote")) return "bg-sky-50 text-sky-700 border-sky-200";
  if (t.includes("contract")) return "bg-orange-50 text-orange-700 border-orange-200";
  return "bg-gray-50 text-gray-700 border-gray-200";
};

const buildLinkedInUrl = (title: string, company: string, location?: string) => {
  const keywords = encodeURIComponent(`${title} ${company}`.trim());
  const loc = location ? `&location=${encodeURIComponent(location)}` : "";
  return `https://www.linkedin.com/jobs/search/?keywords=${keywords}${loc}&sortBy=R`;
};

const CircularScore = ({ score }: { score: number }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const label = score >= 75 ? "Great fit!" : score >= 50 ? "Moderate fit" : "Needs work";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
        />
        <text x="70" y="63" textAnchor="middle" fontSize="28" fontWeight="700" fill={color}>
          {score}
        </text>
        <text x="70" y="80" textAnchor="middle" fontSize="10" fill="#9ca3af">
          out of 100
        </text>
        <text x="70" y="96" textAnchor="middle" fontSize="10" fontWeight="600" fill={color}>
          {label}
        </text>
      </svg>
      <p className="text-sm font-medium text-muted-foreground">Overall Fit Score</p>
    </div>
  );
};

// Similar job card styled the same as Job Finder
const SimilarJobCard = ({ job }: { job: SimilarJob }) => {
  const linkedinUrl = buildLinkedInUrl(job.title, job.company, job.location);

  const handleApply = () =>
    window.open(linkedinUrl, "_blank", "noopener,noreferrer");

  return (
    <div className="p-5 rounded-xl border bg-card space-y-3 hover:shadow-md hover:border-emerald-200 transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
            {job.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">{job.company}</span>
            <span className="text-muted-foreground/40">·</span>
            <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground truncate">{job.location}</span>
          </div>
        </div>
        {job.matchScore != null && (
          <div
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm font-bold shrink-0 ${scoreCardColor(job.matchScore)}`}
          >
            <Star className="w-3.5 h-3.5" />
            {job.matchScore}%
          </div>
        )}
      </div>

      {job.matchScore != null && (
        <div className="w-full h-1.5 rounded-full bg-gray-100">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${scoreBarCardColor(job.matchScore)}`}
            style={{ width: `${job.matchScore}%` }}
          />
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {job.jobType && (
          <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${jobTypeColor(job.jobType)}`}>
            {job.jobType}
          </span>
        )}
        {job.experienceRequired && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {job.experienceRequired}
          </span>
        )}
        {job.salary && job.salary !== "Not disclosed" && job.salary !== "N/A" && (
          <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
            {job.salary}
          </span>
        )}
      </div>

      {job.whyGoodFit && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-100 leading-relaxed">
          <Sparkles className="w-3.5 h-3.5 inline mr-1.5 text-emerald-500" />
          {job.whyGoodFit}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {(job.matchedSkills || []).slice(0, 4).map((s) => (
          <Badge key={s} variant="outline" className="text-xs text-emerald-700 border-emerald-200 bg-emerald-50">
            ✓ {s}
          </Badge>
        ))}
        {(job.missingSkills || []).slice(0, 2).map((s) => (
          <Badge key={s} variant="outline" className="text-xs text-red-500 border-red-200 bg-red-50">
            ✗ {s}
          </Badge>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-1 border-t">
        <Button
          size="sm"
          className="flex-1 bg-[#0A66C2] hover:bg-[#004182] text-white gap-1.5"
          onClick={handleApply}
        >
          <LinkedInLogo />
          Apply with LinkedIn
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1.5 hover:border-sky-300 hover:text-sky-700"
          onClick={handleApply}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Details
        </Button>
      </div>
    </div>
  );
};

export const JobCompatibilityPage = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [extractingResume, setExtractingResume] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { jobTitle: "", company: "", jobDescription: "" },
  });

  const { isValid, isSubmitting } = form.formState;

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateResumeFile(file);
    if (!validation.valid) {
      toast.error("Invalid file", { description: validation.error });
      return;
    }
    try {
      setExtractingResume(true);
      const text = await extractTextFromDocument(file);
      if (text.length < 50) {
        toast.error("Resume too short", {
          description: "Could not extract enough text. Please try a text-based PDF or upload a TXT file.",
        });
        return;
      }
      setResumeFile(file);
      setResumeText(text);
      toast.success("Resume uploaded", { description: "Text extracted successfully." });
    } catch (err) {
      toast.error("Extraction failed", {
        description: err instanceof Error ? err.message : "Failed to extract text. Try converting your PDF to TXT.",
      });
    } finally {
      setExtractingResume(false);
    }
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
    setResumeText("");
    toast.info("Resume removed");
  };

  const cleanJson = (text: string) => {
    let clean = text.trim().replace(/(json|```|`)/g, "");
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found in AI response");
    return JSON.parse(match[0]);
  };

  const onSubmit = async (data: FormData) => {
    if (!resumeText || resumeText.trim().length < 50) {
      toast.error("Resume required", {
        description: "Please upload your resume to analyse job compatibility.",
      });
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const prompt = `You are a senior career advisor. Provide a detailed, honest compatibility analysis between this resume and job description.

Job Title: ${data.jobTitle}
Company: ${data.company}

Job Description:
${data.jobDescription}

Candidate Resume:
${resumeText}

Return ONLY a valid JSON object. No markdown, no code fences, no extra text. Just the raw JSON object:
{
  "overallScore": 72,
  "summary": "2-3 honest sentences summarising fit based on the actual resume content vs job requirements",
  "verdict": "Strong candidate",
  "strengths": ["specific strength drawn from resume matching JD", "strength 2", "strength 3"],
  "weaknesses": ["specific gap between resume and JD", "gap 2", "gap 3"],
  "categoryScores": [
    { "category": "Technical Skills", "score": 80, "notes": "specific observation referencing actual technologies" },
    { "category": "Experience Level", "score": 65, "notes": "specific observation" },
    { "category": "Domain Knowledge", "score": 70, "notes": "specific observation" },
    { "category": "Soft Skills", "score": 75, "notes": "specific observation" },
    { "category": "Education & Certs", "score": 60, "notes": "specific observation" }
  ],
  "improvements": [
    { "skill": "specific skill from JD that candidate lacks", "priority": "high", "suggestion": "actionable suggestion", "resource": "e.g. Udemy, Coursera, official docs" },
    { "skill": "skill", "priority": "medium", "suggestion": "suggestion", "resource": "resource" },
    { "skill": "skill", "priority": "low", "suggestion": "suggestion", "resource": "resource" }
  ],
  "actionPlan": [
    "Specific action step tailored to this candidate and role",
    "Step 2",
    "Step 3",
    "Step 4"
  ],
  "interviewTips": [
    "Tip specific to ${data.company}'s known interview style",
    "Tip specific to the ${data.jobTitle} role requirements",
    "General preparation tip based on the candidate's gaps"
  ],
  "similarJobs": [
    {
      "title": "Similar realistic job title",
      "company": "Well-known real tech company name",
      "location": "Remote or realistic city",
      "matchScore": 78,
      "matchedSkills": ["skill candidate has that matches", "skill2"],
      "missingSkills": ["skill the job needs that candidate lacks"],
      "experienceRequired": "2-4 years",
      "jobType": "Full-time",
      "salary": "$85,000 - $120,000/yr",
      "whyGoodFit": "Why this is a good alternative given the candidate's actual background"
    },
    {
      "title": "Another similar realistic role",
      "company": "Another real well-known company",
      "location": "Remote",
      "matchScore": 72,
      "matchedSkills": ["skill1", "skill2"],
      "missingSkills": ["missing skill"],
      "experienceRequired": "1-3 years",
      "jobType": "Full-time",
      "salary": "$80,000 - $110,000/yr",
      "whyGoodFit": "Match note based on candidate profile"
    }
  ]
}

Rules:
- verdict must be exactly one of: "Strong candidate", "Moderate fit", "Needs improvement"
- improvements.priority must be exactly "high", "medium", or "low"
- All scores are integers 0-100
- overallScore must reflect the actual match — do not default to 0 or 100
- Be specific — reference actual content from the resume and job description
- similarJobs must have realistic matchScore values (not 0)
- Use only real, well-known company names for similarJobs`;

      const aiResult = await chatSession.sendMessage(prompt);
      const parsed: CompatibilityResult = cleanJson(aiResult.response.text());

      // Sanity check — if score is 0 something went wrong
      if (!parsed || typeof parsed.overallScore !== "number" || parsed.overallScore === 0) {
        throw new Error("AI returned an invalid score. Please try again.");
      }

      setResult(parsed);

      toast.success("Analysis complete!", {
        description: `Your compatibility score is ${parsed.overallScore}/100.`,
      });

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      console.error(err);
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const jobTitle = form.watch("jobTitle");
  const company = form.watch("company");

  const handleApplyDirect = () => {
    const url = buildLinkedInUrl(jobTitle, company);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col w-full gap-6 py-6">
      <CustomBreadCrumb
        breadCrumbPage="Job Compatibility"
        breadCrumpItems={[{ label: "Jobs", link: "/jobs" }]}
      />

      <Headings
        title="Job Compatibility"
        description="Paste a job description, upload your resume, and get a detailed analytics report on how well you fit the role — plus similar jobs you can apply to."
        isSubHeading
      />

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-start">
        {/* LEFT — sticky form (NO apply button here) */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5 p-6 rounded-xl border bg-card shadow-sm"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Job Title</FormLabel>
                        <FormMessage className="text-xs" />
                      </div>
                      <FormControl>
                        <Input placeholder="e.g. Backend Engineer" {...field} disabled={loading} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Company</FormLabel>
                        <FormMessage className="text-xs" />
                      </div>
                      <FormControl>
                        <Input placeholder="e.g. Google" {...field} disabled={loading} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="jobDescription"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Job Description</FormLabel>
                      <FormMessage className="text-xs" />
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Paste the full job description here..."
                        {...field}
                        disabled={loading}
                        className="min-h-[200px]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Resume — required */}
              <div className="space-y-2">
                <FormLabel>
                  Resume{" "}
                  <span className="text-red-500 text-xs ml-1">* Required</span>
                </FormLabel>
                {resumeFile ? (
                  <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                    <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate flex-1">{resumeFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(resumeFile.size / 1024).toFixed(1)} KB)
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={handleRemoveResume}
                      disabled={loading || extractingResume}
                      className="shrink-0 h-7 w-7"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.txt"
                      onChange={handleResumeUpload}
                      disabled={loading || extractingResume}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="resume-compat"
                    />
                    <label
                      htmlFor="resume-compat"
                      className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                      <p className="text-sm text-muted-foreground">
                        {extractingResume ? "Extracting text..." : "Click to upload your resume"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF or TXT · max 5 MB
                      </p>
                    </label>
                  </div>
                )}
                {resumeFile && (
                  <p className="text-xs text-muted-foreground">
                    ✓ Resume text extracted and ready for analysis
                  </p>
                )}
                {!resumeFile && (
                  <p className="text-xs text-amber-600">
                    Tip: If your PDF fails to parse, try saving it as a TXT file for best results.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-700 text-white"
                disabled={isSubmitting || !isValid || loading || !resumeText}
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <BarChart2 className="w-4 h-4 mr-2" />
                )}
                {loading ? "Analysing..." : "Analyse Compatibility"}
              </Button>
            </form>
          </Form>
        </div>

        {/* RIGHT — scrollable results */}
        <div
          ref={resultsRef}
          className="lg:h-[calc(100vh-12rem)] lg:overflow-y-auto lg:pr-1 space-y-5 scroll-smooth"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#bae6fd transparent" }}
        >
          {loading && (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
              <Loader className="w-8 h-8 animate-spin text-sky-500" />
              <p className="text-sm font-medium">Analysing your compatibility...</p>
              <p className="text-xs text-muted-foreground/60">
                Comparing your resume against job requirements
              </p>
            </div>
          )}

          {!loading && !result && (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground border-2 border-dashed rounded-xl">
              <BarChart2 className="w-12 h-12 opacity-20" />
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">No analysis yet</p>
                <p className="text-xs opacity-70 px-6">
                  Fill in the job details, upload your resume, and click Analyse
                </p>
              </div>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-5">
              {/* Score + verdict + single apply button */}
              <div className="p-5 rounded-xl border bg-card flex flex-col items-center gap-3 text-center">
                <CircularScore score={result.overallScore} />
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                    result.verdict === "Strong candidate"
                      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                      : result.verdict === "Moderate fit"
                        ? "text-amber-700 bg-amber-50 border-amber-200"
                        : "text-red-600 bg-red-50 border-red-200"
                  }`}
                >
                  {result.verdict}
                </span>
                <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                  {result.summary}
                </p>
                {/* Single apply button — only in results panel */}
                <Button
                  className="w-full max-w-xs bg-[#0A66C2] hover:bg-[#004182] text-white gap-2"
                  onClick={handleApplyDirect}
                >
                  <LinkedInLogo />
                  Apply with LinkedIn
                </Button>
              </div>

              {/* Category scores */}
              <div className="p-5 rounded-xl border bg-card space-y-3">
                <h3 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-sky-500" />
                  Category Breakdown
                </h3>
                {result.categoryScores.map((cat) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 font-medium">{cat.category}</span>
                      <span className={`font-bold ${scoreToColor(cat.score)}`}>{cat.score}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100">
                      <div
                        className={`h-2 rounded-full transition-all duration-700 ${scoreToBarColor(cat.score)}`}
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{cat.notes}</p>
                  </div>
                ))}
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-100 space-y-2">
                  <h3 className="text-sm font-semibold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Strengths
                  </h3>
                  <ul className="space-y-1.5">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-emerald-700 flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-xl border bg-red-50 border-red-100 space-y-2">
                  <h3 className="text-sm font-semibold text-red-700 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> Gaps
                  </h3>
                  <ul className="space-y-1.5">
                    {result.weaknesses.map((w, i) => (
                      <li key={i} className="text-xs text-red-600 flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Improvements */}
              <div className="p-5 rounded-xl border bg-card space-y-3">
                <h3 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Skills to Improve
                </h3>
                {result.improvements.map((imp, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border text-sm space-y-1 ${priorityColors[imp.priority] || priorityColors.low}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{imp.skill}</span>
                      <span className="text-xs uppercase tracking-wide opacity-70 font-medium">
                        {imp.priority}
                      </span>
                    </div>
                    <p className="text-xs opacity-80 leading-relaxed">{imp.suggestion}</p>
                    {imp.resource && (
                      <p className="text-xs opacity-60 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {imp.resource}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Action plan */}
              <div className="p-5 rounded-xl border bg-card space-y-3">
                <h3 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Your Action Plan
                </h3>
                <ol className="space-y-2.5">
                  {result.actionPlan.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-gray-700 leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Interview tips */}
              {result.interviewTips?.length > 0 && (
                <div className="p-5 rounded-xl border bg-sky-50 border-sky-100 space-y-3">
                  <h3 className="font-semibold text-sm text-sky-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-500" />
                    Interview Tips for {company}
                  </h3>
                  <ul className="space-y-2">
                    {result.interviewTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-sky-700">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Similar jobs — Job Finder card style */}
              {result.similarJobs?.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-500" />
                      Similar Jobs You Can Apply To
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground px-1">
                    Based on your profile, these alternative roles may be great fits too.
                  </p>
                  {result.similarJobs.map((job, i) => (
                    <SimilarJobCard key={i} job={job} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};