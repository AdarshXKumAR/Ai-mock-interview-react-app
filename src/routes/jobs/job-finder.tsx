import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader, Upload, X, Search, Briefcase, Star } from "lucide-react";

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
  description: string;
  whyGoodFit: string;
}

const scoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
  return "text-red-500 bg-red-50 border-red-200";
};

const scoreBar = (score: number) => {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-yellow-400";
  return "bg-red-400";
};

export const JobFinderPage = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [extractingResume, setExtractingResume] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<JobMatch[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobRole: "",
      description: "",
      experience: 0,
      techStack: "",
      includeInternships: false,
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const handleResumeUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
          description: "Could not extract enough text. Please check the file.",
        });
        return;
      }
      setResumeFile(file);
      setResumeText(text);
      toast.success("Resume uploaded", {
        description: "Resume text extracted successfully.",
      });
    } catch (err) {
      toast.error("Extraction failed", {
        description:
          err instanceof Error ? err.message : "Failed to extract text.",
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

      const resumeSection = resumeText.trim().length > 50
        ? `\nCandidate Resume:\n${resumeText}\n`
        : "";

      const prompt = `
You are a job matching expert. Based on the candidate's profile below, generate exactly 5 realistic job listings that would be a good match. Each job should be an actual type of role found in the market.

Candidate Profile:
- Desired role: ${data.jobRole}
- What they are looking for: ${data.description}
- Years of experience: ${data.experience}
- Tech stack: ${data.techStack}
- Include internships: ${data.includeInternships ? "Yes" : "No"}
${resumeSection}

Return ONLY a valid JSON array of exactly 5 objects with these fields:
[
  {
    "title": "Job title",
    "company": "Company name (realistic tech company)",
    "location": "City, Country or Remote",
    "matchScore": 85,
    "matchedSkills": ["skill1", "skill2"],
    "missingSkills": ["skill3", "skill4"],
    "experienceRequired": "2-4 years",
    "jobType": "Full-time" or "Internship" or "Contract",
    "description": "2-sentence job description",
    "whyGoodFit": "1-2 sentences explaining why this candidate is a good fit"
  }
]

Rules:
- matchScore is an integer from 0 to 100 based on how well the candidate fits
- matchedSkills are skills from the candidate's profile that match the job
- missingSkills are key skills the job requires that the candidate lacks
- If includeInternships is true, include at least 1 internship
- Make companies, locations and roles realistic and varied
- No extra text, no markdown, just the JSON array
`;

      const aiResult = await chatSession.sendMessage(prompt);
      const parsed: JobMatch[] = cleanJson(aiResult.response.text());
      setResults(parsed);
      toast.success("Jobs found!", {
        description: `Found ${parsed.length} matching jobs for you.`,
      });
    } catch (err) {
      console.error(err);
      toast.error("Error", {
        description: "Something went wrong. Please try again.",
      });
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
        description="Tell us what you are looking for and upload your resume. We will find jobs that match your profile."
        isSubHeading
      />

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-6">
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
                      <Input
                        placeholder="e.g. Frontend Developer"
                        {...field}
                        disabled={loading}
                      />
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
                        placeholder="e.g. A remote React role at a product-based company with good mentorship..."
                        {...field}
                        disabled={loading}
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
                        <FormLabel>Years of Experience</FormLabel>
                        <FormMessage className="text-xs" />
                      </div>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="includeInternships"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-end">
                      <FormLabel>Include Internships</FormLabel>
                      <div className="flex items-center gap-2 h-10">
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
                          className="text-sm text-muted-foreground"
                        >
                          Yes
                        </label>
                      </div>
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
                        className="min-h-[80px]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Resume upload */}
              <div className="space-y-2">
                <FormLabel>Resume (Optional — improves matching)</FormLabel>
                {resumeFile ? (
                  <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                    <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate flex-1">
                      {resumeFile.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({(resumeFile.size / 1024).toFixed(1)} KB)
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={handleRemoveResume}
                      disabled={loading || extractingResume}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
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
                      className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                      <p className="text-sm text-muted-foreground">
                        {extractingResume
                          ? "Extracting text..."
                          : "Click to upload resume"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF or TXT, max 5 MB
                      </p>
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

        {/* Results */}
        <div className="space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
              <Loader className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-sm">Searching for matching jobs...</p>
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground border-2 border-dashed rounded-xl">
              <Briefcase className="w-10 h-10 opacity-30" />
              <p className="text-sm">
                Fill in the form and click Find to see results
              </p>
            </div>
          )}

          {!loading &&
            results.map((job, i) => (
              <div
                key={i}
                className="p-5 rounded-xl border bg-card space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-base text-gray-800">
                      {job.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {job.company} · {job.location}
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-1 px-3 py-1 rounded-full border text-sm font-semibold shrink-0 ${scoreColor(job.matchScore)}`}
                  >
                    <Star className="w-3.5 h-3.5" />
                    {job.matchScore}%
                  </div>
                </div>

                {/* Score bar */}
                <div className="w-full h-1.5 rounded-full bg-gray-100">
                  <div
                    className={`h-1.5 rounded-full transition-all ${scoreBar(job.matchScore)}`}
                    style={{ width: `${job.matchScore}%` }}
                  />
                </div>

                <p className="text-sm text-muted-foreground">
                  {job.description}
                </p>

                <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-100">
                  {job.whyGoodFit}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {job.matchedSkills.map((s) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className="text-xs text-emerald-700 border-emerald-300 bg-emerald-50"
                    >
                      {s}
                    </Badge>
                  ))}
                  {job.missingSkills.map((s) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className="text-xs text-red-500 border-red-200 bg-red-50"
                    >
                      missing: {s}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                  <span className="px-2 py-0.5 rounded bg-muted">
                    {job.jobType}
                  </span>
                  <span>{job.experienceRequired}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};