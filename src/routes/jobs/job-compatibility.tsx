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
  Send,
  Building2,
  Sparkles,
  BookOpen,
} from "lucide-react";

import { CustomBreadCrumb } from "@/components/custom-bread-crumb";
import { Headings } from "@/components/headings";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  applyUrl: string;
  linkedinUrl: string;
  matchNote: string;
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
        toast.error("Resume too short", { description: "Could not extract enough text." });
        return;
      }
      setResumeFile(file);
      setResumeText(text);
      toast.success("Resume uploaded", { description: "Text extracted successfully." });
    } catch (err) {
      toast.error("Extraction failed", {
        description: err instanceof Error ? err.message : "Failed to extract text.",
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

      const linkedinQuery = encodeURIComponent(`${data.jobTitle} ${data.company}`);

      const prompt = `You are a senior career advisor. Provide a detailed compatibility analysis between this resume and job description.

Job Title: ${data.jobTitle}
Company: ${data.company}

Job Description:
${data.jobDescription}

Candidate Resume:
${resumeText}

Return ONLY a valid JSON object. No markdown, no code fences, no extra text. Just the raw JSON object starting with { and ending with }:
{
  "overallScore": 72,
  "summary": "2-3 honest sentences summarising fit",
  "verdict": "Strong candidate",
  "strengths": ["specific strength from resume/JD", "strength 2", "strength 3"],
  "weaknesses": ["specific gap", "gap 2", "gap 3"],
  "categoryScores": [
    { "category": "Technical Skills", "score": 80, "notes": "specific observation" },
    { "category": "Experience Level", "score": 65, "notes": "specific observation" },
    { "category": "Domain Knowledge", "score": 70, "notes": "specific observation" },
    { "category": "Soft Skills", "score": 75, "notes": "specific observation" },
    { "category": "Education & Certs", "score": 60, "notes": "specific observation" }
  ],
  "improvements": [
    { "skill": "specific skill", "priority": "high", "suggestion": "actionable suggestion", "resource": "learning resource name" },
    { "skill": "skill", "priority": "medium", "suggestion": "suggestion", "resource": "resource" },
    { "skill": "skill", "priority": "low", "suggestion": "suggestion", "resource": "resource" }
  ],
  "actionPlan": [
    "Specific action step 1",
    "Step 2",
    "Step 3",
    "Step 4"
  ],
  "interviewTips": [
    "Company-specific tip for ${data.company}",
    "Role-specific tip for ${data.jobTitle}",
    "General preparation tip"
  ],
  "similarJobs": [
    {
      "title": "Similar role title",
      "company": "Real alternative company",
      "location": "Remote or City",
      "applyUrl": "https://www.linkedin.com/jobs/search/?keywords=${linkedinQuery}",
      "linkedinUrl": "https://www.linkedin.com/jobs/search/?keywords=${linkedinQuery}",
      "matchNote": "Why this is a good alternative"
    },
    {
      "title": "Another similar role",
      "company": "Another real company",
      "location": "Remote",
      "applyUrl": "https://www.linkedin.com/jobs/search/?keywords=${linkedinQuery}",
      "linkedinUrl": "https://www.linkedin.com/jobs/search/?keywords=${linkedinQuery}",
      "matchNote": "Match note"
    }
  ]
}

Rules:
- verdict must be exactly one of: "Strong candidate", "Moderate fit", "Needs improvement"
- improvements.priority must be exactly "high", "medium", or "low"
- All scores are integers 0-100
- Be specific — reference actual skills from resume and JD
- interviewTips should be genuinely useful and specific to ${data.company}`;

      const aiResult = await chatSession.sendMessage(prompt);
      const parsed: CompatibilityResult = cleanJson(aiResult.response.text());
      setResult(parsed);

      toast.success("Analysis complete!", {
        description: `Your compatibility score is ${parsed.overallScore}/100.`,
      });

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      console.error(err);
      toast.error("Error", { description: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDirect = () => {
    const q = encodeURIComponent(`${form.getValues("jobTitle")} ${form.getValues("company")}`);
    window.open(
      `https://www.linkedin.com/jobs/search/?keywords=${q}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleApplySimilar = (job: SimilarJob) => {
    window.open(job.linkedinUrl || job.applyUrl, "_blank", "noopener,noreferrer");
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
        {/* LEFT — sticky form */}
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
                      <p className="text-xs text-muted-foreground">PDF or TXT · max 5 MB</p>
                    </label>
                  </div>
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

              {result && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2 border-sky-200 text-sky-700 hover:bg-sky-50"
                  onClick={handleApplyDirect}
                >
                  <Send className="w-4 h-4" />
                  Apply to {form.getValues("company")} on LinkedIn
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </Button>
              )}
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
              <p className="text-xs text-muted-foreground/60">Comparing resume against job requirements</p>
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
              {/* Score + verdict + apply */}
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
                <Button
                  className="w-full max-w-xs bg-sky-600 hover:bg-sky-700 gap-2"
                  onClick={handleApplyDirect}
                >
                  <Send className="w-4 h-4" />
                  Apply to {form.getValues("company")}
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
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
                    className={`p-3 rounded-lg border text-sm space-y-1 ${priorityColors[imp.priority]}`}
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
                    Interview Tips for {form.getValues("company")}
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

              {/* Similar jobs */}
              {result.similarJobs?.length > 0 && (
                <div className="p-5 rounded-xl border bg-card space-y-3">
                  <h3 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-500" />
                    Similar Jobs You Can Apply To
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Based on your profile, these alternative roles may be great fits too.
                  </p>
                  <div className="space-y-3">
                    {result.similarJobs.map((job, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-lg border bg-muted/30 space-y-2 hover:border-emerald-200 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{job.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {job.company} · {job.location}
                          </p>
                        </div>
                        <p className="text-xs text-emerald-700 bg-emerald-50 rounded px-2 py-1.5 border border-emerald-100">
                          {job.matchNote}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 gap-1"
                            onClick={() => handleApplySimilar(job)}
                          >
                            <Send className="w-3 h-3" />
                            Apply
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 text-xs gap-1 hover:border-sky-300 hover:text-sky-700"
                            onClick={() =>
                              window.open(job.linkedinUrl, "_blank", "noopener,noreferrer")
                            }
                          >
                            <ExternalLink className="w-3 h-3" />
                            View on LinkedIn
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};