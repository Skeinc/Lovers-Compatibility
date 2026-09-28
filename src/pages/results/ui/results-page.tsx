import { ResultsBoard } from "@/widgets/results-board";
import { useComparison } from "@/entities/session";

export function ResultsPage() {
  const comparison = useComparison();
  if (!comparison?.report) return null;
  return (
    <main>
      <ResultsBoard view={comparison} />
    </main>
  );
}
