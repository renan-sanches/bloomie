interface CareTask {
  id: string;
  plantId: string;
  type: "water" | "mist" | "fertilize" | "rotate";
  dueDate: string;
  completed: boolean;
  completedDate?: string;
  snoozedUntil?: string;
  xpEarned?: number;
}

const PLANT_ID = "target-plant-id";

function generateTasks(count: number): CareTask[] {
  const tasks: CareTask[] = [];
  for (let i = 0; i < count; i++) {
    tasks.push({
      id: `task-${i}`,
      plantId: Math.random() > 0.8 ? PLANT_ID : `other-${i}`, // 20% match
      type: "water",
      dueDate: new Date().toISOString(),
      completed: Math.random() > 0.9, // 10% completed
    });
  }
  return tasks;
}

function runBenchmark(count: number, iterations: number = 100) {
  const tasks = generateTasks(count);
  const plant = { id: PLANT_ID };

  // Warm up
  tasks.filter((t) => t.plantId === plant.id && !t.completed);

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    tasks.filter((t) => t.plantId === plant.id && !t.completed);
  }
  const end = performance.now();
  const avg = (end - start) / iterations;

  console.log(`[N=${count}] Avg time per filter: ${avg.toFixed(4)} ms`);
}

console.log("--- Benchmark Results ---");
runBenchmark(100);
runBenchmark(1000);
runBenchmark(5000);
runBenchmark(10000);
runBenchmark(50000);
