export type Note = {
  id: string;
  title: string;
  department: string;
  semester: string;
  subject: string;
  uploader: string;
  size: string;
  downloads: number;
  updatedAt: string;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  department: string;
  semester: string;
  condition: "New" | "Good" | "Fair";
  mode: "Sell" | "Exchange" | "Donate";
  price?: string;
  owner: string;
  contact: string;
  cover: string;
  description: string;
};

export type LostItem = {
  id: string;
  title: string;
  type: "Lost" | "Found";
  location: string;
  date: string;
  status: "Open" | "Resolved";
  description: string;
  contact: string;
  image: string;
};

export type BusStop = {
  name: string;
  time: string;
  passed: boolean;
};

export type BusRoute = {
  id: string;
  number: string;
  route: string;
  pickup: string;
  drop: string;
  driver: string;
  driverPhone: string;
  status: "On Time" | "Delayed" | "Cancelled" | "Route Changed";
  note: string;
  eta: string;
  stops: BusStop[];
  lastUpdated: string;
};


export type Announcement = {
  id: string;
  title: string;
  category:
    | "Notice"
    | "Event"
    | "Scholarship"
    | "Seminar"
    | "Workshop"
    | "Exam"
    | "Holiday"
    | "Emergency"
    | "Circular";
  body: string;
  date: string;
  pinned?: boolean;
};

export const departments = [
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Civil",
  "Business",
  "Design",
];
export const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];

export const notes: Note[] = [
  { id: "n1", title: "Data Structures — Complete Notes", department: "Computer Science", semester: "3", subject: "DSA", uploader: "Aarav S.", size: "4.2 MB", downloads: 312, updatedAt: "2 days ago" },
  { id: "n2", title: "Digital Electronics Lab Manual", department: "Electronics", semester: "3", subject: "DE Lab", uploader: "Meera K.", size: "2.1 MB", downloads: 148, updatedAt: "1 week ago" },
  { id: "n3", title: "Thermodynamics — Unit 1 to 3", department: "Mechanical", semester: "4", subject: "Thermo", uploader: "Rohit P.", size: "6.8 MB", downloads: 220, updatedAt: "3 days ago" },
  { id: "n4", title: "Operating Systems Quick Revision", department: "Computer Science", semester: "5", subject: "OS", uploader: "Sana R.", size: "1.4 MB", downloads: 512, updatedAt: "5 hours ago" },
  { id: "n5", title: "Structural Analysis — Formula Sheet", department: "Civil", semester: "5", subject: "SA", uploader: "Karan D.", size: "0.9 MB", downloads: 96, updatedAt: "yesterday" },
  { id: "n6", title: "Marketing Management Case Studies", department: "Business", semester: "2", subject: "MM", uploader: "Priya N.", size: "3.3 MB", downloads: 74, updatedAt: "4 days ago" },
];

export const books: Book[] = [
  { id: "b1", title: "Introduction to Algorithms", author: "Cormen", department: "Computer Science", semester: "4", condition: "Good", mode: "Sell", price: "₹450", owner: "Devansh", contact: "+91 98xxx 12345", cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600", description: "Barely used, no highlights. 3rd edition." },
  { id: "b2", title: "Signals & Systems", author: "Oppenheim", department: "Electronics", semester: "4", condition: "Fair", mode: "Exchange", owner: "Nisha", contact: "+91 98xxx 55532", cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600", description: "Exchange for Digital Signal Processing." },
  { id: "b3", title: "Engineering Mechanics", author: "Hibbeler", department: "Mechanical", semester: "2", condition: "New", mode: "Sell", price: "₹700", owner: "Aditya", contact: "+91 98xxx 88811", cover: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600", description: "Untouched copy from senior batch." },
  { id: "b4", title: "Concrete Technology", author: "M.S. Shetty", department: "Civil", semester: "5", condition: "Good", mode: "Donate", owner: "Kavya", contact: "+91 98xxx 20301", cover: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=600", description: "Free to any junior in Civil dept." },
  { id: "b5", title: "Principles of Marketing", author: "Kotler", department: "Business", semester: "1", condition: "Good", mode: "Sell", price: "₹300", owner: "Ishaan", contact: "+91 98xxx 77712", cover: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600", description: "Notes inside first chapter only." },
  { id: "b6", title: "Design of Everyday Things", author: "Don Norman", department: "Design", semester: "3", condition: "New", mode: "Exchange", owner: "Ritika", contact: "+91 98xxx 43219", cover: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600", description: "Exchange for any Interaction Design book." },
];

export const lostItems: LostItem[] = [
  { id: "l1", title: "Blue Water Bottle", type: "Lost", location: "Library — 2nd Floor", date: "Today", status: "Open", description: "Steel bottle with a small sticker of a cat.", contact: "+91 98xxx 11122", image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600" },
  { id: "l2", title: "Black Casio Calculator", type: "Found", location: "Exam Hall B", date: "Yesterday", status: "Open", description: "FX-991ES Plus. Found on desk 34.", contact: "Reception", image: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600" },
  { id: "l3", title: "College ID Card — Ananya", type: "Found", location: "Canteen", date: "2 days ago", status: "Resolved", description: "Returned to owner via student council.", contact: "—", image: "https://images.unsplash.com/photo-1580785692949-7ea36b32ad11?w=600" },
  { id: "l4", title: "Bunch of Keys with red tag", type: "Lost", location: "Parking Lot A", date: "3 days ago", status: "Open", description: "Two keys, one Yamaha keychain.", contact: "+91 98xxx 34411", image: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=600" },
];

export const buses: BusRoute[] = [
  { id: "bus1", number: "Bus 01", route: "Campus → City Centre", pickup: "Main Gate 7:30 AM", drop: "City Centre 8:20 AM", driver: "Ramesh K.", driverPhone: "+91 98xxx 91234", status: "On Time", note: "Regular schedule.", eta: "Arrives in 8 min", lastUpdated: "2 min ago", stops: [
    { name: "Main Gate", time: "7:30 AM", passed: true },
    { name: "Hostel Circle", time: "7:38 AM", passed: true },
    { name: "MG Road Junction", time: "7:52 AM", passed: true },
    { name: "Market Square", time: "8:06 AM", passed: false },
    { name: "City Centre", time: "8:20 AM", passed: false },
  ] },
  { id: "bus2", number: "Bus 02", route: "Campus → Airport Road", pickup: "Gate B 7:45 AM", drop: "Airport Road 8:35 AM", driver: "Suresh M.", driverPhone: "+91 98xxx 55112", status: "Delayed", note: "Traffic near flyover, delayed 15 min.", eta: "Arrives in 22 min", lastUpdated: "5 min ago", stops: [
    { name: "Gate B", time: "7:45 AM", passed: true },
    { name: "Science Block", time: "7:52 AM", passed: true },
    { name: "Flyover Crossing", time: "8:10 AM", passed: false },
    { name: "Cargo Road", time: "8:24 AM", passed: false },
    { name: "Airport Road", time: "8:35 AM", passed: false },
  ] },
  { id: "bus3", number: "Bus 03", route: "Campus → Rail Station", pickup: "Hostel Block 4:30 PM", drop: "Rail Station 5:10 PM", driver: "Anil T.", driverPhone: "+91 98xxx 77332", status: "Route Changed", note: "Diverted via Ring Road today.", eta: "Arrives in 12 min", lastUpdated: "just now", stops: [
    { name: "Hostel Block", time: "4:30 PM", passed: true },
    { name: "Admin Building", time: "4:36 PM", passed: true },
    { name: "Ring Road (diversion)", time: "4:50 PM", passed: false },
    { name: "Old Bus Stand", time: "5:00 PM", passed: false },
    { name: "Rail Station", time: "5:10 PM", passed: false },
  ] },
  { id: "bus4", number: "Bus 04", route: "Campus → Tech Park", pickup: "Gate C 8:00 AM", drop: "Tech Park 8:40 AM", driver: "Prakash V.", driverPhone: "+91 98xxx 66221", status: "Cancelled", note: "Cancelled due to maintenance.", eta: "—", lastUpdated: "20 min ago", stops: [
    { name: "Gate C", time: "8:00 AM", passed: false },
    { name: "Sports Complex", time: "8:10 AM", passed: false },
    { name: "IT Corridor", time: "8:26 AM", passed: false },
    { name: "Tech Park", time: "8:40 AM", passed: false },
  ] },
  { id: "bus5", number: "Bus 05", route: "Campus → North Colony", pickup: "Library Gate 5:00 PM", drop: "North Colony 5:45 PM", driver: "Vikram J.", driverPhone: "+91 98xxx 88443", status: "On Time", note: "Running on schedule.", eta: "Arrives in 30 min", lastUpdated: "3 min ago", stops: [
    { name: "Library Gate", time: "5:00 PM", passed: true },
    { name: "North Gate", time: "5:08 PM", passed: false },
    { name: "Green Park", time: "5:22 PM", passed: false },
    { name: "Sector 9", time: "5:34 PM", passed: false },
    { name: "North Colony", time: "5:45 PM", passed: false },
  ] },
];


export const announcements: Announcement[] = [
  { id: "a1", title: "Mid-Semester Exam Schedule Released", category: "Exam", body: "Exams begin Nov 12. Check the notice board and student portal for your seating plan.", date: "Today", pinned: true },
  { id: "a2", title: "TechFest 2026 — Registrations Open", category: "Event", body: "Register for coding sprints, robotics, and design jam by Nov 20.", date: "Today" },
  { id: "a3", title: "National Merit Scholarship — Apply Now", category: "Scholarship", body: "Applications close Nov 30. Documents must be verified at the Dean's office.", date: "Yesterday" },
  { id: "a4", title: "Workshop: AI for Beginners", category: "Workshop", body: "Free 2-day workshop by CS Dept. Limited to 60 seats.", date: "2 days ago" },
  { id: "a5", title: "Campus Closed on Nov 24 (Public Holiday)", category: "Holiday", body: "All classes and offices remain closed. Hostels open as usual.", date: "3 days ago" },
  { id: "a6", title: "Fire Safety Drill — Block C", category: "Emergency", body: "Mandatory drill at 3 PM Thursday. Please cooperate with security.", date: "4 days ago" },
  { id: "a7", title: "Guest Seminar: Future of EVs", category: "Seminar", body: "By Dr. Meera Rao. Auditorium 2, 5 PM Friday.", date: "5 days ago" },
];

export const events = [
  { id: "e1", title: "Coding Sprint", date: "Nov 18", time: "10:00 AM", venue: "CS Block" },
  { id: "e2", title: "Cultural Night", date: "Nov 22", time: "7:00 PM", venue: "Open Air Theatre" },
  { id: "e3", title: "Career Fair", date: "Nov 25", time: "9:30 AM", venue: "Auditorium 1" },
];

export const statusColor = (s: BusRoute["status"]) => {
  switch (s) {
    case "On Time":
      return "bg-success/15 text-success border-success/30";
    case "Delayed":
      return "bg-warning/20 text-warning-foreground border-warning/40";
    case "Cancelled":
      return "bg-destructive/15 text-destructive border-destructive/30";
    case "Route Changed":
      return "bg-info/15 text-info border-info/30";
  }
};
