"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark, Search } from "lucide-react";
import { questionBank } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";

export function QuestionBankClient() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const categories = ["All", ...Array.from(new Set(questionBank.map((item) => item.category)))];
  const filtered = useMemo(
    () => questionBank.filter((item) => (category === "All" || item.category === category) && item.question.toLowerCase().includes(query.toLowerCase())),
    [category, query]
  );

  return (
    <div className="space-y-8">
      <PageHeader title="Question bank" description="Browse interview prompts by category, difficulty, and skill area." />
      <div className="grid gap-3 md:grid-cols-[1fr_260px]">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Search questions" />
        </div>
        <Select value={category} onChange={(event) => setCategory(event.target.value)} options={categories.map((item) => ({ label: item, value: item }))} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <Card key={item.question} className="glass">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <Badge>{item.category}</Badge>
                <button className="rounded-md p-2 text-muted-foreground hover:bg-slate-900 hover:text-white" aria-label="Save question">
                  <Bookmark className="h-4 w-4" />
                </button>
              </div>
              <h2 className="mt-5 min-h-20 text-lg font-semibold leading-snug text-white">{item.question}</h2>
              <div className="mt-5 flex items-center justify-between">
                <Badge variant="outline">{item.difficulty}</Badge>
                <Button asChild size="sm" variant="secondary"><Link href="/practice">Practice</Link></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
