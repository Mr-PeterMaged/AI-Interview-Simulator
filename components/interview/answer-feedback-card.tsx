import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AnswerFeedbackCard({ tips }: { tips: string[] }) {
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-base">Answer tips</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {tips.map((tip) => (
            <li key={tip} className="rounded-md bg-slate-950/50 p-3">{tip}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
