"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import OutputFeedback from "@/components/OutputFeedback";
import CopyButton from "@/components/CopyButton";

interface Sprint {
  name: string;
  plannedPoints: number;
  completedPoints: number;
  teamSize: number;
}

interface VelocityMetrics {
  sprints: Sprint[];
  velocities: number[];
  averageVelocity: number;
  trend: "accelerating" | "stable" | "decelerating";
  trendPercent: number;
  forecast: number;
  chartData: Array<{
    sprint: string;
    velocity: number;
    planned: number;
    completed: number;
  }>;
}

export default function VelocityTracker() {
  const [sprints, setSprints] = useState<Sprint[]>([
    { name: "Sprint 1", plannedPoints: 40, completedPoints: 38, teamSize: 4 },
  ]);
  const [currentSprintName, setCurrentSprintName] = useState("Sprint 2");
  const [plannedPoints, setPlannedPoints] = useState("");
  const [completedPoints, setCompletedPoints] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [metrics, setMetrics] = useState<VelocityMetrics | null>(null);
  const [output, setOutput] = useState("");
  const [exportFormat, setExportFormat] = useState<"markdown" | "jira">(
    "markdown"
  );

  // Calculate velocity metrics
  const calculateMetrics = (sprintList: Sprint[]): VelocityMetrics => {
    const velocities = sprintList.map((s) => s.completedPoints);
    const averageVelocity =
      velocities.reduce((a, b) => a + b, 0) / velocities.length;

    // Trend: compare last 2 sprints
    let trend: "accelerating" | "stable" | "decelerating" = "stable";
    let trendPercent = 0;
    if (velocities.length >= 2) {
      const lastVelocity = velocities[velocities.length - 1];
      const prevVelocity = velocities[velocities.length - 2];
      trendPercent = Math.round(
        ((lastVelocity - prevVelocity) / prevVelocity) * 100
      );
      if (trendPercent > 5) trend = "accelerating";
      else if (trendPercent < -5) trend = "decelerating";
    }

    // Forecast: extrapolate average velocity
    const forecast = Math.round(averageVelocity);

    // Chart data
    const chartData = sprintList.map((s) => ({
      sprint: s.name,
      velocity: s.completedPoints,
      planned: s.plannedPoints,
      completed: s.completedPoints,
    }));

    return {
      sprints: sprintList,
      velocities,
      averageVelocity: Math.round(averageVelocity * 10) / 10,
      trend,
      trendPercent,
      forecast,
      chartData,
    };
  };

  // Generate output
  const generateOutput = (m: VelocityMetrics, format: "markdown" | "jira") => {
    const avgVel = m.averageVelocity.toFixed(1);
    const lastVel =
      m.velocities.length > 0
        ? m.velocities[m.velocities.length - 1]
        : "N/A";

    const trendEmoji =
      m.trend === "accelerating" ? "📈" : m.trend === "decelerating" ? "📉" : "➡️";

    if (format === "markdown") {
      return `# Velocity Report

## Summary
- **Current Sprint Velocity:** ${lastVel} points
- **Average Velocity:** ${avgVel} points
- **Trend:** ${trendEmoji} ${m.trend.charAt(0).toUpperCase() + m.trend.slice(1)} (${m.trendPercent > 0 ? "+" : ""}${m.trendPercent}%)
- **Forecast (Next Sprint):** ${m.forecast} points

## Sprint History
| Sprint | Planned | Completed | Velocity |
|--------|---------|-----------|----------|
${m.sprints.map((s) => `| ${s.name} | ${s.plannedPoints} | ${s.completedPoints} | ${s.completedPoints} |`).join("\n")}

## Metrics
- **Completion Rate:** ${Math.round((m.sprints.reduce((a, b) => a + b.completedPoints, 0) / m.sprints.reduce((a, b) => a + b.plannedPoints, 0)) * 100)}%
- **Team Size:** ${m.sprints[m.sprints.length - 1].teamSize} members
- **Velocity Per Person:** ${(m.averageVelocity / m.sprints[m.sprints.length - 1].teamSize).toFixed(1)} points/person

## Recommendations
${
  m.trend === "decelerating"
    ? "- Consider investigating blockers or team capacity issues\n- Review sprint scope and prioritization"
    : m.trend === "accelerating"
      ? "- Team is improving - maintain momentum\n- Consider slight scope increase if sustainable"
      : "- Velocity is stable - good predictability\n- Continue current planning practices"
}`;
    } else {
      // Jira format
      return `h2. Velocity Report

*Current Sprint:* ${lastVel} points
*Average:* ${avgVel} points
*Trend:* ${trendEmoji} ${m.trend} (${m.trendPercent > 0 ? "+" : ""}${m.trendPercent}%)
*Forecast:* ${m.forecast} points

h3. Sprint Breakdown

${m.sprints.map((s) => `* ${s.name}: ${s.completedPoints}/${s.plannedPoints} points`).join("\n")}

h3. Key Metrics

* Completion Rate: ${Math.round((m.sprints.reduce((a, b) => a + b.completedPoints, 0) / m.sprints.reduce((a, b) => a + b.plannedPoints, 0)) * 100)}%
* Team Size: ${m.sprints[m.sprints.length - 1].teamSize} members
* Velocity Per Person: ${(m.averageVelocity / m.sprints[m.sprints.length - 1].teamSize).toFixed(1)} points/person`;
    }
  };

  // Add sprint
  const handleAddSprint = () => {
    if (!plannedPoints || !completedPoints || !teamSize) {
      alert("Please fill in all fields");
      return;
    }

    const newSprint: Sprint = {
      name: currentSprintName,
      plannedPoints: parseInt(plannedPoints),
      completedPoints: parseInt(completedPoints),
      teamSize: parseInt(teamSize),
    };

    const updatedSprints = [...sprints, newSprint];
    setSprints(updatedSprints);

    const newMetrics = calculateMetrics(updatedSprints);
    setMetrics(newMetrics);
    setOutput(generateOutput(newMetrics, exportFormat));

    trackEvent("generator_run", {
      tool: "velocity_tracker",
      mode: "input",
      sprint_count: updatedSprints.length,
    });

    // Reset form
    setPlannedPoints("");
    setCompletedPoints("");
    setTeamSize("");
    setCurrentSprintName(`Sprint ${updatedSprints.length + 1}`);
  };

  // Remove sprint
  const handleRemoveSprint = (index: number) => {
    const updatedSprints = sprints.filter((_, i) => i !== index);
    setSprints(updatedSprints);

    if (updatedSprints.length > 0) {
      const newMetrics = calculateMetrics(updatedSprints);
      setMetrics(newMetrics);
      setOutput(generateOutput(newMetrics, exportFormat));
    } else {
      setMetrics(null);
      setOutput("");
    }
  };

  // Initial calculation on mount
  useEffect(() => {
    const initialMetrics = calculateMetrics(sprints);
    setMetrics(initialMetrics);
    setOutput(generateOutput(initialMetrics, exportFormat));
  }, []);

  // Update output when format changes
  useEffect(() => {
    if (metrics) {
      setOutput(generateOutput(metrics, exportFormat));
    }
  }, [exportFormat]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Velocity Tracker
          </h1>
          <p className="text-gray-600 mb-8">
            Track team sprint velocity, visualize trends, and forecast future
            capacity.{" "}
            <Link href="/tools/velocity-tracker" className="text-blue-600">
              View guide →
            </Link>
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Form */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                Add Sprint Data
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sprint Name
                </label>
                <input
                  type="text"
                  value={currentSprintName}
                  onChange={(e) => setCurrentSprintName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Sprint 2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Planned Points
                </label>
                <input
                  type="number"
                  value={plannedPoints}
                  onChange={(e) => setPlannedPoints(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Completed Points
                </label>
                <input
                  type="number"
                  value={completedPoints}
                  onChange={(e) => setCompletedPoints(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="38"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Size
                </label>
                <input
                  type="number"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="4"
                />
              </div>

              <button
                onClick={handleAddSprint}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
              >
                Add Sprint
              </button>

              {/* Sprint History */}
              <div className="mt-8 space-y-2">
                <h3 className="font-semibold text-gray-900">Sprint History</h3>
                {sprints.map((sprint, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-md"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {sprint.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {sprint.completedPoints}/{sprint.plannedPoints} pts
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveSprint(i)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics & Chart */}
            <div className="lg:col-span-2 space-y-8">
              {metrics && (
                <>
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Current Velocity</div>
                      <div className="text-3xl font-bold text-blue-700">
                        {metrics.velocities[metrics.velocities.length - 1]}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">points</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Average Velocity</div>
                      <div className="text-3xl font-bold text-purple-700">
                        {metrics.averageVelocity}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">points</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Trend</div>
                      <div className="text-2xl font-bold text-green-700">
                        {metrics.trend === "accelerating"
                          ? "📈"
                          : metrics.trend === "decelerating"
                            ? "📉"
                            : "➡️"}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {metrics.trendPercent > 0 ? "+" : ""}
                        {metrics.trendPercent}%
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Forecast</div>
                      <div className="text-3xl font-bold text-orange-700">
                        {metrics.forecast}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">points</div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Velocity Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={metrics.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="sprint" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="velocity"
                          stroke="#2563eb"
                          strokeWidth={2}
                          name="Completed Points"
                        />
                        <Line
                          type="monotone"
                          dataKey="planned"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="Planned Points"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Output Section */}
          {output && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">Output</h2>
                <select
                  value={exportFormat}
                  onChange={(e) =>
                    setExportFormat(e.target.value as "markdown" | "jira")
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="markdown">Markdown</option>
                  <option value="jira">Jira Wiki</option>
                </select>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <pre className="text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap break-words">
                  {output}
                </pre>
              </div>

              <div className="flex gap-3">
                <CopyButton text={output} />
                <button
                  onClick={() => {
                    trackEvent("output_feedback", {
                      tool: "velocity_tracker",
                      format: exportFormat,
                    });
                  }}
                  className="flex-1 bg-gray-200 text-gray-900 py-2 px-4 rounded-md hover:bg-gray-300"
                >
                  Share Feedback
                </button>
              </div>

              <OutputFeedback tool="velocity_tracker" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
