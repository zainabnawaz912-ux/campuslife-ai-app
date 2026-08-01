import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { Book, LostItem } from "@/lib/mock-data";

const FALLBACK_BOOK_COVER =
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600";
const FALLBACK_ITEM_IMAGE =
  "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600";

const optionalUrl = z
  .string()
  .trim()
  .max(500, "Link is too long")
  .refine((v) => v === "" || /^https?:\/\//i.test(v), "Enter a valid http(s) link")
  .optional();

export const bookFormSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(120, "Title is too long"),
  author: z.string().trim().min(2, "Author is required").max(80, "Author is too long"),
  department: z.string().trim().min(1, "Select a department"),
  semester: z.string().trim().min(1, "Select a semester"),
  condition: z.enum(["New", "Good", "Fair"]),
  mode: z.enum(["Sell", "Exchange", "Donate"]),
  price: z.string().trim().max(20, "Price is too long").optional(),
  owner: z.string().trim().min(2, "Your name is required").max(60, "Name is too long"),
  contact: z.string().trim().min(5, "Contact is required").max(80, "Contact is too long"),
  cover: optionalUrl,
  description: z.string().trim().max(500, "Keep the description under 500 characters").optional(),
});

export type BookFormValues = z.infer<typeof bookFormSchema>;

export const lostItemFormSchema = z.object({
  title: z.string().trim().min(2, "Item name is required").max(120, "Item name is too long"),
  type: z.enum(["Lost", "Found"]),
  location: z.string().trim().min(2, "Location is required").max(120, "Location is too long"),
  date: z.string().trim().min(1, "When did this happen?").max(40, "Too long"),
  contact: z.string().trim().min(2, "Contact is required").max(80, "Contact is too long"),
  image: optionalUrl,
  description: z.string().trim().max(500, "Keep the description under 500 characters").optional(),
});

export type LostItemFormValues = z.infer<typeof lostItemFormSchema>;

type BookRow = {
  id: string;
  title: string;
  author: string;
  department: string;
  semester: string;
  condition: string;
  mode: string;
  price: string | null;
  owner: string;
  contact: string;
  cover: string | null;
  description: string | null;
};

type LostItemRow = {
  id: string;
  title: string;
  type: string;
  location: string;
  date: string;
  status: string;
  description: string | null;
  contact: string;
  image: string | null;
};

function toBook(row: BookRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    department: row.department,
    semester: row.semester,
    condition: (row.condition as Book["condition"]) ?? "Good",
    mode: (row.mode as Book["mode"]) ?? "Sell",
    price: row.price ?? undefined,
    owner: row.owner,
    contact: row.contact,
    cover: row.cover || FALLBACK_BOOK_COVER,
    description: row.description ?? "",
  };
}

function toLostItem(row: LostItemRow): LostItem {
  return {
    id: row.id,
    title: row.title,
    type: (row.type as LostItem["type"]) ?? "Lost",
    location: row.location,
    date: row.date,
    status: (row.status as LostItem["status"]) ?? "Open",
    description: row.description ?? "",
    contact: row.contact,
    image: row.image || FALLBACK_ITEM_IMAGE,
  };
}

export const booksQueryKey = ["books", "listings"] as const;
export const lostItemsQueryKey = ["lost-found", "reports"] as const;

export async function fetchBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from("books" as never)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as BookRow[]).map(toBook);
}

export async function createBook(values: BookFormValues): Promise<Book> {
  const parsed = bookFormSchema.parse(values);
  const payload = {
    title: parsed.title,
    author: parsed.author,
    department: parsed.department,
    semester: parsed.semester,
    condition: parsed.condition,
    mode: parsed.mode,
    price: parsed.mode === "Sell" ? parsed.price?.trim() || null : null,
    owner: parsed.owner,
    contact: parsed.contact,
    cover: parsed.cover?.trim() || FALLBACK_BOOK_COVER,
    description: parsed.description?.trim() || "",
  };
  const { data, error } = await supabase
    .from("books" as never)
    .insert(payload as never)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return toBook(data as unknown as BookRow);
}

export async function fetchLostItems(): Promise<LostItem[]> {
  const { data, error } = await supabase
    .from("lost_items" as never)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as LostItemRow[]).map(toLostItem);
}

export async function createLostItem(values: LostItemFormValues): Promise<LostItem> {
  const parsed = lostItemFormSchema.parse(values);
  const payload = {
    title: parsed.title,
    type: parsed.type,
    location: parsed.location,
    date: parsed.date,
    status: "Open",
    contact: parsed.contact,
    image: parsed.image?.trim() || FALLBACK_ITEM_IMAGE,
    description: parsed.description?.trim() || "",
  };
  const { data, error } = await supabase
    .from("lost_items" as never)
    .insert(payload as never)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return toLostItem(data as unknown as LostItemRow);
}
