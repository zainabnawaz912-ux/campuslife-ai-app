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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  booksQueryKey,
  bookFormSchema,
  createBook,
  type BookFormValues,
} from "@/lib/campus-data";
import type { Book } from "@/lib/mock-data";

const empty: BookFormValues = {
  title: "",
  author: "",
  department: "Computer Science",
  semester: "1",
  condition: "Good",
  mode: "Sell",
  price: "",
  owner: "",
  contact: "",
  cover: "",
  description: "",
};

const departments = [
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Civil",
  "Business",
  "Design",
];

export function AddBookDialog() {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<BookFormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const set = <K extends keyof BookFormValues>(key: K, value: BookFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => {
      if (!e[key as string]) return e;
      const next = { ...e };
      delete next[key as string];
      return next;
    });
  };

  const mutation = useMutation({
    mutationFn: createBook,
    onSuccess: (book) => {
      queryClient.setQueryData<Book[]>(booksQueryKey, (prev) => [book, ...(prev ?? [])]);
      queryClient.invalidateQueries({ queryKey: booksQueryKey });
      toast.success("Book listed successfully");
      setValues(empty);
      setErrors({});
      setOpen(false);
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Could not save your book. Please try again.",
      );
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = bookFormSchema.safeParse(values);
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
        <Button className="rounded-xl">
          <Plus size={16} /> List a book
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>List a book</DialogTitle>
          <DialogDescription>
            Share a textbook with fellow students — sell, swap or donate it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="book-title">Title</Label>
              <Input
                id="book-title"
                value={values.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Introduction to Algorithms"
                className="mt-1 rounded-xl"
              />
              {err("title")}
            </div>
            <div>
              <Label htmlFor="book-author">Author</Label>
              <Input
                id="book-author"
                value={values.author}
                onChange={(e) => set("author", e.target.value)}
                placeholder="Cormen"
                className="mt-1 rounded-xl"
              />
              {err("author")}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Department</Label>
              <Select value={values.department} onValueChange={(v) => set("department", v)}>
                <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {err("department")}
            </div>
            <div>
              <Label>Semester</Label>
              <Select value={values.semester} onValueChange={(v) => set("semester", v)}>
                <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["1", "2", "3", "4", "5", "6", "7", "8"].map((s) => (
                    <SelectItem key={s} value={s}>Semester {s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {err("semester")}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label>Condition</Label>
              <Select
                value={values.condition}
                onValueChange={(v) => set("condition", v as BookFormValues["condition"])}
              >
                <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Listing type</Label>
              <Select
                value={values.mode}
                onValueChange={(v) => set("mode", v as BookFormValues["mode"])}
              >
                <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sell">Sell</SelectItem>
                  <SelectItem value="Exchange">Exchange</SelectItem>
                  <SelectItem value="Donate">Donate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="book-price">Price</Label>
              <Input
                id="book-price"
                value={values.price ?? ""}
                onChange={(e) => set("price", e.target.value)}
                disabled={values.mode !== "Sell"}
                placeholder="₹450"
                className="mt-1 rounded-xl"
              />
              {err("price")}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="book-owner">Your name</Label>
              <Input
                id="book-owner"
                value={values.owner}
                onChange={(e) => set("owner", e.target.value)}
                placeholder="Devansh"
                className="mt-1 rounded-xl"
              />
              {err("owner")}
            </div>
            <div>
              <Label htmlFor="book-contact">Contact</Label>
              <Input
                id="book-contact"
                value={values.contact}
                onChange={(e) => set("contact", e.target.value)}
                placeholder="+91 98xxx 12345"
                className="mt-1 rounded-xl"
              />
              {err("contact")}
            </div>
          </div>

          <div>
            <Label htmlFor="book-cover">Cover image link (optional)</Label>
            <Input
              id="book-cover"
              value={values.cover ?? ""}
              onChange={(e) => set("cover", e.target.value)}
              placeholder="https://..."
              className="mt-1 rounded-xl"
            />
            {err("cover")}
          </div>

          <div>
            <Label htmlFor="book-desc">Description (optional)</Label>
            <Textarea
              id="book-desc"
              value={values.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Barely used, no highlights."
              className="mt-1 rounded-xl"
              rows={3}
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
                  <Loader2 size={16} className="animate-spin" /> Saving…
                </>
              ) : (
                "Add book"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
