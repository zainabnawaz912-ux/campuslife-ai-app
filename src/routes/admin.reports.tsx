import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Student reports — CampusLife AI Admin" },
      { name: "description", content: "Reports, flags and activity summaries." },
    ],
  }),
  component: Reports,
});

const reports = [
  { id: "r1", type: "Inappropriate listing", target: "Book: XYZ", reporter: "Meera K.", status: "Open", when: "Today" },
  { id: "r2", type: "Suspicious note", target: "Note: OS Rev", reporter: "Rohit P.", status: "Reviewing", when: "Yesterday" },
  { id: "r3", type: "Duplicate lost item", target: "Water bottle", reporter: "Ananya", status: "Resolved", when: "2 days ago" },
];

function Reports() {
  return (
    <>
      <PageHeader title="Student reports" subtitle="Handle flagged content and support requests." />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Open reports</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>When</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.type}</TableCell>
                  <TableCell>{r.target}</TableCell>
                  <TableCell>{r.reporter}</TableCell>
                  <TableCell className="text-muted-foreground">{r.when}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "Resolved" ? "secondary" : "outline"} className="rounded-full">{r.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
