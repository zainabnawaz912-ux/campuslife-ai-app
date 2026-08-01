import { CalendarClock, Loader2, Sparkles, Target } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MarkdownView } from "@/components/learning/MarkdownView";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { runAiTask } from "@/lib/ai-learning";

export function StudyCoachTab() {
  const [subjects, setSubjects] = useState("");
  const [examDate, setExamDate] = useState("");
  const [hours, setHours] = useState("3");
  const [goal, setGoal] = useState("");
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subjects.trim().length < 2) {
      toast.error("Add at least one subject or topic.");
      return;
    }
    const numericHours = Number(hours);
    if (!numericHours || numericHours <= 0 || numericHours > 16) {
      toast.error("Enter study hours between 1 and 16.");
      return;
    }
    setBusy(true);
    setPlan("");
    try {
      const text = await runAiTask("coach", {
        subjects: subjects.trim(),
        examDate: examDate.trim(),
        hours,
        goal: goal.trim(),
      });
      setPlan(text);
      toast.success("Your personalised study plan is ready!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 font-semibold">
            <Target size={16} className="text-primary" /> Tell your coach about your exams
          </div>
          <form onSubmit={submit} className="mt-4 space-y-4">
            <div>
              <Label>Subjects / topics</Label>
              <Textarea
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                maxLength={400}
                rows={2}
                className="mt-1.5 rounded-xl"
                placeholder="e.g. DBMS, Operating Systems, Engineering Maths III"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Exam date</Label>
                <Input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="mt-1.5 rounded-xl"
                />
              </div>
              <div>
                <Label>Study hours per day</Label>
                <Input
                  type="number"
                  min={1}
                  max={16}
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="mt-1.5 rounded-xl"
                />
              </div>
            </div>
            <div>
              <Label>Learning goal</Label>
              <Input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                maxLength={200}
                className="mt-1.5 rounded-xl"
                placeholder="e.g. Score above 85% and clear all backlogs"
              />
            </div>
            <Button type="submit" disabled={busy} className="w-full rounded-xl sm:w-auto">
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
              {busy ? "Building your plan…" : "Generate study plan"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {busy && (
        <Card>
          <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
            <Loader2 size={18} className="animate-spin text-primary" />
            Designing your timetable, revision schedule and priority topics…
          </CardContent>
        </Card>
      )}

      {plan && (
        <Card className="animate-in fade-in-50">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2 font-semibold">
              <CalendarClock size={16} className="text-primary" /> Your personalised plan
            </div>
            <MarkdownView>{plan}</MarkdownView>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
