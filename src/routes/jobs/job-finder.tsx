import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Loader,
  Upload,
  X,
  Search,
  Briefcase,
  Star,
  ExternalLink,
  Send,
  MapPin,
  Clock,
  Building2,
  ChevronDown,
  ChevronUp,
  Sparkles,
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
import { Badge } from "@/components/ui/badge";
import { chatSession } from "@/scripts";
import {
  extractTextFromDocument,
  validateResumeFile,
} from "@/lib/resume-extractor";

const formSchema = z.object({
  jobRole: z.string().min(2, "Job role is required"),
  description: z.string().min(10, "Please describe what you are looking for"),
  experience: z.coerce.number().min(0, "Experience cannot be negative"),
  techStack: z.string().min(1, "Tech stack is required"),
  location: z.string().optional(),
  includeInternships: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface JobMatch {
  title: string;
  company: string;
  location: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceRequired: string;
  jobType: string;
  salary: string;
  description: string;
  whyGoodFit: string;
  postedDate: string;
  applyUrl: string;
  linkedinUrl: string;
  tags: string[];
}

const scoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-500 bg-red-50 border-red-200";
};

const scoreBarColor = (score: number) => {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-400";
  return "bg-red-400";
};

const jobTypeColor = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes("intern")) return "bg-purple-50 text-purple-700 border-purple-200";
  if (t.includes("remote")) return "bg-sky-50 text-sky-700 border-sky-200";
  if (t.includes("contract")) return "bg-orange-50 text-orange-700 border-orange-200";
  return "bg-gray-50 text-gray-700 border-gray-200";
};

const JobCard = ({ job }: { job: JobMatch }) => {
  const [expanded, setExpanded] = useState(false);

  const handleApply = () => {
    const q = encodeURIComponent(`${job.title} ${job.company}`);
    window.open(
      `https://www.linkedin.com/jobs/search/?keywords=${q}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleViewDetails = () => {
    const q = encodeURIComponent(`${job.title} ${job.company} ${job.location}`);
    window.open(
      `https://www.linkedin.com/jobs/search/?keywords=${q}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

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
        <div
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm font-bold shrink-0 ${scoreColor(job.matchScore)}`}
        >
          <Star className="w-3.5 h-3.5" />
          {job.matchScore}%
        </div>
      </div>

      <div className="w-full h-1.5 rounded-full bg-gray-100">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${scoreBarColor(job.matchScore)}`}
          style={{ width: `${job.matchScore}%` }}
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${jobTypeColor(job.jobType)}`}>
          {job.jobType}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {job.postedDate}
        </span>
        {job.salary && job.salary !== "Not disclosed" && (
          <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
            {job.salary}
          </span>
        )}
      </div>

      <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-100 leading-relaxed">
        <Sparkles className="w-3.5 h-3.5 inline mr-1.5 text-emerald-500" />
        {job.whyGoodFit}
      </p>

      {expanded && (
        <p className="text-sm text-muted-foreground leading-relaxed border-t pt-3">
          {job.description}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {job.matchedSkills.slice(0, 5).map((s) => (
          <Badge key={s} variant="outline" className="text-xs text-emerald-700 border-emerald-200 bg-emerald-50">
            ✓ {s}
          </Badge>
        ))}
        {job.missingSkills.slice(0, 3).map((s) => (
          <Badge key={s} variant="outline" className="text-xs text-red-500 border-red-200 bg-red-50">
            ✗ {s}
          </Badge>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-1 border-t">
        <Button
          size="sm"
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
          onClick={handleApply}
        >
          <Send className="w-3.5 h-3.5" />
          Apply Now
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1.5 hover:border-sky-300 hover:text-sky-700"
          onClick={handleViewDetails}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View on LinkedIn
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="shrink-0 text-muted-foreground hover:text-gray-700"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};

export const JobFinderPage = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [extractingResume, setExtractingResume] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<JobMatch[]>([]);
  const resultsRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobRole: "",
      description: "",
      experience: 0,
      techStack: "",
      location: "",
      includeInternships: false,
    },
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
    const match = clean.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("No JSON array found in AI response");
    return JSON.parse(match[0]);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setResults([]);

      const resumeSection =
        resumeText.trim().length > 50 ? `\nCandidate Resume:\n${resumeText}\n` : "";
      const locationHint = data.location?.trim()
        ? `Preferred location: ${data.location}`
        : "Location: flexible / remote preferred";

      const prompt = `You are a job matching expert with real job market knowledge. Generate exactly 6 realistic job listings that match this candidate's profile.

Candidate Profile:
- Desired role: ${data.jobRole}
- What they are looking for: ${data.description}
- Years of experience: ${data.experience}
- Tech stack: ${data.techStack}
- ${locationHint}
- Include internships: ${data.includeInternships ? "Yes" : "No"}
${resumeSection}

Return ONLY a valid JSON array of exactly 6 objects. No markdown, no code fences, no extra text. Just the raw JSON array starting with [ and ending with ]:
[
  {
    "title": "Exact job title",
    "company": "Real well-known tech company (Google, Stripe, Shopify, Vercel, Notion, Figma, Airbnb, Netflix, Spotify, GitHub, Atlassian, Twilio, Cloudflare, etc.)",
    "location": "City, Country or Remote",
    "matchScore": 85,
    "matchedSkills": ["skill1", "skill2", "skill3"],
    "missingSkills": ["missing1", "missing2"],
    "experienceRequired": "2-4 years",
    "jobType": "Full-time",
    "salary": "$90,000 - $130,000/yr",
    "description": "2-3 sentence realistic job description mentioning specific technologies.",
    "whyGoodFit": "1-2 specific sentences about why this candidate fits this role.",
    "postedDate": "2 days ago",
    "applyUrl": "https://careers.google.com",
    "linkedinUrl": "https://www.linkedin.com/jobs/search/?keywords=Software%20Engineer%20Google",
    "tags": ["React", "Remote", "Series B"]
  }
]

Rules:
- matchScore: integer 0-100
- jobType: one of "Full-time", "Part-time", "Contract", "Internship", "Remote"
- If includeInternships is true, include at least 2 internship entries
- Mix large tech, mid-size product companies, and startups
- Make salary ranges realistic for the role and experience level
- For linkedinUrl use: https://www.linkedin.com/jobs/search/?keywords=TITLE%20COMPANY (URL-encode spaces as %20)`;

      const aiResult = await chatSession.sendMessage(prompt);
      const parsed: JobMatch[] = cleanJson(aiResult.response.text());
      setResults(parsed);

      toast.success("Jobs found!", {
        description: `Found ${parsed.length} matching jobs for you.`,
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

  return (
    <div className="flex flex-col w-full gap-6 py-6">
      <CustomBreadCrumb
        breadCrumbPage="Job Finder"
        breadCrumpItems={[{ label: "Jobs", link: "/jobs" }]}
      />

      <Headings
        title="Job Finder"
        description="Tell us what you are looking for and upload your resume. We'll match you with active job listings that fit your profile."
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
              <FormField
                control={form.control}
                name="jobRole"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Job Role / Title</FormLabel>
                      <FormMessage className="text-xs" />
                    </div>
                    <FormControl>
                      <Input placeholder="e.g. Frontend Developer" {...field} disabled={loading} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>What are you looking for?</FormLabel>
                      <FormMessage className="text-xs" />
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. A remote React role at a product company with good mentorship..."
                        {...field}
                        disabled={loading}
                        className="min-h-[90px]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Years Exp.</FormLabel>
                        <FormMessage className="text-xs" />
                      </div>
                      <FormControl>
                        <Input type="number" min={0} placeholder="0" {...field} disabled={loading} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Preferred Location</FormLabel>
                        <FormMessage className="text-xs" />
                      </div>
                      <FormControl>
                        <Input placeholder="e.g. Remote, NYC" {...field} disabled={loading} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="techStack"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Tech Stack</FormLabel>
                      <FormMessage className="text-xs" />
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. React, TypeScript, Node.js, PostgreSQL"
                        {...field}
                        disabled={loading}
                        className="min-h-[70px]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="includeInternships"
                render={({ field }) => (
                  <FormItem className="flex items-end gap-3">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={loading}
                      className="w-4 h-4 accent-emerald-500"
                      id="internships"
                    />
                    <label
                      htmlFor="internships"
                      className="text-sm text-muted-foreground cursor-pointer select-none"
                    >
                      Include internships
                    </label>
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>
                  Resume{" "}
                  <span className="text-muted-foreground text-xs font-normal ml-1">
                    (optional — improves matching)
                  </span>
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
                      id="resume-finder"
                    />
                    <label
                      htmlFor="resume-finder"
                      className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                      <p className="text-sm text-muted-foreground">
                        {extractingResume ? "Extracting..." : "Click to upload resume"}
                      </p>
                      <p className="text-xs text-muted-foreground">PDF or TXT · max 5 MB</p>
                    </label>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !isValid || loading}
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                {loading ? "Finding Jobs..." : "Find Matching Jobs"}
              </Button>
            </form>
          </Form>
        </div>

        {/* RIGHT — scrollable results */}
        <div
          ref={resultsRef}
          className="lg:h-[calc(100vh-12rem)] lg:overflow-y-auto lg:pr-1 space-y-4 scroll-smooth"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#d1fae5 transparent" }}
        >
          {loading && (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
              <Loader className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-sm font-medium">Searching for matching jobs...</p>
              <p className="text-xs text-muted-foreground/60">This may take a few seconds</p>
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground border-2 border-dashed rounded-xl">
              <Briefcase className="w-12 h-12 opacity-20" />
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">No results yet</p>
                <p className="text-xs opacity-70">Fill in the form and click Find to see matching jobs</p>
              </div>
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <div className="flex items-center justify-between px-1 pb-1">
                <p className="text-sm text-muted-foreground font-medium">
                  {results.length} jobs matched your profile
                </p>
                <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200">
                  Sorted by match
                </Badge>
              </div>
              {[...results]
                .sort((a, b) => b.matchScore - a.matchScore)
                .map((job, i) => (
                  <JobCard key={i} job={job} />
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};