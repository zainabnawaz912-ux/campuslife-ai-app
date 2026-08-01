import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createLostItem,
  lostItemFormSchema,
  lostItemsQueryKey,
  type LostItemFormValues,
} from "@/lib/campus-data";
import type { LostItem } from "@/lib/mock-data";

export function ReportItemDialog({ type }: { type: "Lost" | "Found" }) {
  const empty: LostItemFormValues = {
    title: "",
    type,
    location: "",
    date: "Today",
    contact: "",
    image: "",
    description: "",
  };

  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<LostItemFormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const set = <K extends keyof LostItemFormValues>(key: K, value: LostItemFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => {
      if (!e[key as string]) return e;
      const next = { ...e };
      delete next[key as string];
      return next;
    });
  };

  const mutation = useMutation({
    mutationFn: createLostItem,
    onSuccess: (item) => {
      queryClient.setQueryData<LostItem[]>(lostItemsQueryKey, (prev) => [item, ...(prev ?? [])]);
      queryClient.invalidateQueries({ queryKey: lostItemsQueryKey });
      toast.success(`${type} item reported successfully`);
      setValues(empty);
      setErrors({});
      setOpen(false);
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Could not save your report. Please try again.",
      );
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = lostItemFormSchema.safeParse({ ...values, type });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    mutation.mutate(result.data);
  };

  const err = (k: string) =>
    errors[k] ? <p className="mt-1 text-xs text-destructive">{errors[k]}</p> : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (mutation.isPending) return;
        setOpen(o);
        if (!o) setErrors({});
      }}
    >
      <DialogTrigger asChild>
        <Button variant={type === "Lost" ? "outline" : "default"} className="rounded-xl">
          <Plus size={16} /> Report {type}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Report {type.toLowerCase()} item</DialogTitle>
          <DialogDescription>
            {type === "Lost"
              ? "Tell us what you lost so others can help you find it."
              : "Found something on campus? Help it reach its owner."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-3">
          <div>
            <Label htmlFor={`item-title-${type}`}>Item name</Label>
            <Input
              id={`item-title-${type}`}
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Blue water bottle"
              className="mt-1 rounded-xl"
            />
            {err("title")}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor={`item-loc-${type}`}>Location</Label>
              <Input
                id={`item-loc-${type}`}
                value={values.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Library — 2nd Floor"
                className="mt-1 rounded-xl"
              />
              {err("location")}
            </div>
            <div>
              <Label htmlFor={`item-date-${type}`}>When</Label>
              <Input
                id={`item-date-${type}`}
                value={values.date}
                onChange={(e) => set("date", e.target.value)}
                placeholder="Today"
                className="mt-1 rounded-xl"
              />
              {err("date")}
            </div>
          </div>

          <div>
            <Label htmlFor={`item-contact-${type}`}>Contact</Label>
            <Input
              id={`item-contact-${type}`}
              value={values.contact}
              onChange={(e) => set("contact", e.target.value)}
              placeholder="+91 98xxx 11122"
              className="mt-1 rounded-xl"
            />
            {err("contact")}
          </div>

          <div>
            <Label htmlFor={`item-image-${type}`}>Image link (optional)</Label>
            <Input
              id={`item-image-${type}`}
              value={values.image ?? ""}
              onChange={(e) => set("image", e.target.value)}
              placeholder="https://..."
              className="mt-1 rounded-xl"
            />
            {err("image")}
          </div>

          <div>
            <Label htmlFor={`item-desc-${type}`}>Description (optional)</Label>
            <Textarea
              id={`item-desc-${type}`}
              value={values.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Steel bottle with a small cat sticker."
              rows={3}
              className="mt-1 rounded-xl"
            />
            {err("description")}
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={mutation.isPending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Submitting…
                </>
              ) : (
                `Submit report`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
