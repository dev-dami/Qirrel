export interface BenchmarkRow {
  name: string;
  opsPerSec: number;
  avgMs: number;
  p99Ms: number;
  slowdownVsBaseline: number;
}

interface TaskResult {
  hz: number;
  mean: number;
  p99: number;
}

interface TaskLike {
  name: string;
  result?: TaskResult;
}

export function toRows(tasks: TaskLike[], baselineName: string): BenchmarkRow[] {
  const baseline = tasks.find((task) => task.name === baselineName)?.result?.hz ?? 0;

  return tasks.map((task) => {
    const hz = task.result?.hz ?? 0;
    const slowdown = baseline > 0 && hz > 0 ? baseline / hz : 0;

    return {
      name: task.name,
      opsPerSec: Math.round(hz),
      avgMs: task.result ? Number(task.result.mean.toFixed(3)) : 0,
      p99Ms: task.result ? Number(task.result.p99.toFixed(3)) : 0,
      slowdownVsBaseline: Number(slowdown.toFixed(2)),
    };
  });
}

export function printRows(rows: BenchmarkRow[]): void {
  console.table(
    rows.map((row) => ({
      name: row.name,
      "ops/sec": row.opsPerSec,
      "avg ms": row.avgMs,
      "p99 ms": row.p99Ms,
      "vs direct": `${row.slowdownVsBaseline.toFixed(2)}x`,
    })),
  );
}

