import { useState, useEffect } from "react";
import { motion } from "motion/react";
import axios from "axios";
import {
  Trophy,
  Brain,
  Target,
  TrendingUp,
  Star,
  CheckCircle2,
  XCircle,
  SkipForward,
  AlertCircle,
} from "lucide-react";

interface Step8ResultsProps {
  onRestart: () => void;
}

interface QALogItem {
  question_id: string;
  question: string;
  user_answer: string;
  expected_answer: string;
  is_correct: boolean;
  score: number;
  marked_for_review: boolean;
  skipped: boolean;
  similarity?: number;
  scores?: {
    correctness: number;
    relevance: number;
    communication: number;
    confidence: number;
  };
  overall_score?: number;
  answer_type?: string;
  feedback?: string;
  edited?: boolean;
}

interface ReportData {
  candidate_name: string;
  candidate_id: string;
  score: number;
  qa_log: QALogItem[];
  total_questions: number;
  percentage: number;
  result: string;
  test_completed: boolean;
  completed_at: string;
}

export function Step8Results({ onRestart }: Step8ResultsProps) {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      const candidate_id = localStorage.getItem("candidate_id");
      const candidate_name = localStorage.getItem("candidate_name");

      if (!candidate_id || !candidate_name) {
        throw new Error("Candidate info missing");
      }

      const body = new URLSearchParams();
      body.append("candidate_id", candidate_id);
      body.append("candidate_name", candidate_name);

      const { data } = await axios.post<ReportData>(
        `${import.meta.env.VITE_API_BASE_URL}/questions/get_result`,
        body,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      setReportData(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch report", err);
      setLoading(false);
    }
  };

  /* ---------------- LOADING / ERROR ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">Failed to load report</p>
        </div>
      </div>
    );
  }

  /* ---------------- DERIVED METRICS ---------------- */

  const qaLog = reportData.qa_log;
  const totalQuestions = reportData.total_questions;
  const correct = qaLog.filter((q) => q.is_correct).length;
  const skipped = qaLog.filter((q) => q.skipped).length;
  const incorrect = totalQuestions - correct - skipped;

  const accuracy = reportData.percentage;

  /* ---------------- UI DATA ---------------- */

  const metrics = [
    {
      icon: Trophy,
      label: "Result",
      value: reportData.result,
      color: "text-primary",
    },
    {
      icon: Brain,
      label: "Correct",
      value: correct,
      color: "text-green-500",
    },
    {
      icon: Target,
      label: "Total",
      value: totalQuestions,
      color: "text-secondary",
    },
    {
      icon: TrendingUp,
      label: "Accuracy",
      value: `${accuracy}%`,
      color: "text-blue-500",
    },
  ];

  /* ---------------- RENDER ---------------- */

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto pb-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <Trophy className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-4xl mb-2">Interview Result</h1>
          <p className="text-muted-foreground">
            {reportData.candidate_name} ·{" "}
            {new Date(reportData.completed_at).toLocaleString()}
          </p>
        </motion.div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {metrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-6 text-center"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className={`w-6 h-6 ${m.color}`} />
                </div>
                <p className="text-3xl">{m.value}</p>
                <p className="text-sm text-muted-foreground">{m.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Question-wise */}
        {/* Question-wise */}
        <div className="glass-card rounded-2xl p-8">
          <h3 className="text-xl mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Question-wise Performance
          </h3>

          <div className="space-y-4">
            {qaLog.map((q, i) => (
              <div
                key={q.question_id}
                className="border border-border rounded-xl p-4"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      q.is_correct
                        ? "bg-green-500/10 text-green-500"
                        : q.skipped
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    {q.is_correct ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : q.skipped ? (
                      <SkipForward className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1">
                    <h4 className="text-sm font-medium mb-1">
                      Q{i + 1}: {q.question}
                    </h4>

                    {!q.skipped && (
                      <>
                        <p className="text-sm text-muted-foreground mb-2">
                          Your Answer: {q.user_answer || "—"}
                        </p>
                        {q.feedback && (
                          <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                            <p className="text-xs text-red-800 font-medium mb-1">
                              Feedback:
                            </p>
                            <p className="text-xs text-red-700">{q.feedback}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Score: {q.score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <motion.div>
          <button
              onClick={onRestart}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2"
            >
              {/* <Camera className="w-5 h-5" /> */}
              Thank you and restart
            </button>
        </motion.div>
      </div>
    </div>
  );
}
