"use client";

import { usePersistentState } from "@/hooks/usePersistentState";

interface TeamMember {
  id: number;
  name: string;
  daysAvailable: number;
  velocity: number; // points per day
}

const DEFAULT_MEMBERS: TeamMember[] = [
  { id: 1, name: "Developer 1", daysAvailable: 8, velocity: 2 },
  { id: 2, name: "Developer 2", daysAvailable: 8, velocity: 2 },
];

export default function SprintCapacityCalculator() {
  const [sprintDays, setSprintDays] = usePersistentState("tool-sprint-days-capacity", 10);
  const [members, setMembers] = usePersistentState<TeamMember[]>("tool-members-capacity", DEFAULT_MEMBERS);
  const [nextId, setNextId] = usePersistentState("tool-next-member-capacity", 3);

  const addMember = () => {
    setMembers((prev) => [
      ...prev,
      { id: nextId, name: `Developer ${nextId}`, daysAvailable: sprintDays, velocity: 2 },
    ]);
    setNextId((n) => n + 1);
  };

  const removeMember = (id: number) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMember = (id: number, field: keyof TeamMember, value: string | number) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );
  };

  const totalCapacity = members.reduce((sum, m) => sum + m.daysAvailable * m.velocity, 0);
  const recommendedCapacity = Math.round(totalCapacity * 0.8);
  const maxDays = members.length * sprintDays;
  const totalAvailableDays = members.reduce((sum, m) => sum + m.daysAvailable, 0);
  const utilizationPct = maxDays > 0 ? Math.round((totalAvailableDays / maxDays) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Sprint length */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sprint Length</h2>
        <div className="flex items-center gap-4">
          {[5, 10, 15].map((d) => (
            <button
              key={d}
              onClick={() => {
                setSprintDays(d);
                setMembers((prev) => prev.map((m) => ({ ...m, daysAvailable: Math.min(m.daysAvailable, d) })));
              }}
              className={[
                "px-5 py-2.5 rounded-lg font-medium border text-sm transition-colors",
                sprintDays === d
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400",
              ].join(" ")}
            >
              {d === 5 ? "1 week" : d === 10 ? "2 weeks" : "3 weeks"}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-2">
            <input
              type="number"
              min={1}
              max={30}
              value={sprintDays}
              onChange={(e) => setSprintDays(Math.max(1, Number(e.target.value)))}
              className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
            />
            <span className="text-sm text-gray-500">working days</span>
          </div>
        </div>
      </div>

      {/* Team table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
          <button
            onClick={addMember}
            className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add member
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 pr-4 text-gray-500 font-medium">Name</th>
                <th className="text-left py-2 pr-4 text-gray-500 font-medium">
                  Days available
                  <span className="text-xs font-normal text-gray-400 ml-1">(of {sprintDays})</span>
                </th>
                <th className="text-left py-2 pr-4 text-gray-500 font-medium">
                  Velocity
                  <span className="text-xs font-normal text-gray-400 ml-1">(pts/day)</span>
                </th>
                <th className="text-left py-2 text-gray-500 font-medium">Capacity</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="py-3 pr-4">
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) => updateMember(m.id, "name", e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="number"
                      min={0}
                      max={sprintDays}
                      value={m.daysAvailable}
                      onChange={(e) =>
                        updateMember(m.id, "daysAvailable", Math.min(sprintDays, Math.max(0, Number(e.target.value))))
                      }
                      className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0.5}
                        max={10}
                        step={0.5}
                        value={m.velocity}
                        onChange={(e) => updateMember(m.id, "velocity", Math.max(0.5, Number(e.target.value)))}
                        className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      />
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-semibold text-gray-900">
                      {Math.round(m.daysAvailable * m.velocity)} pts
                    </span>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => removeMember(m.id)}
                      disabled={members.length === 1}
                      className="text-gray-300 hover:text-red-400 disabled:opacity-0 transition-colors text-lg leading-none"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
          <p className="text-sm text-blue-600 font-medium mb-1">Max Capacity</p>
          <p className="text-4xl font-bold text-blue-700">{totalCapacity}</p>
          <p className="text-xs text-blue-500 mt-1">story points</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
          <p className="text-sm text-green-600 font-medium mb-1">Recommended (80%)</p>
          <p className="text-4xl font-bold text-green-700">{recommendedCapacity}</p>
          <p className="text-xs text-green-500 mt-1">story points</p>
        </div>
        <div className={[
          "rounded-xl p-5 text-center border",
          utilizationPct >= 90 ? "bg-red-50 border-red-200" : utilizationPct >= 70 ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-200",
        ].join(" ")}>
          <p className={[
            "text-sm font-medium mb-1",
            utilizationPct >= 90 ? "text-red-600" : utilizationPct >= 70 ? "text-yellow-600" : "text-gray-600",
          ].join(" ")}>Team Availability</p>
          <p className={[
            "text-4xl font-bold",
            utilizationPct >= 90 ? "text-red-700" : utilizationPct >= 70 ? "text-yellow-700" : "text-gray-700",
          ].join(" ")}>{utilizationPct}%</p>
          <p className={[
            "text-xs mt-1",
            utilizationPct >= 90 ? "text-red-500" : utilizationPct >= 70 ? "text-yellow-500" : "text-gray-500",
          ].join(" ")}>
            {totalAvailableDays}/{members.length * sprintDays} days available
          </p>
        </div>
      </div>

      {/* Advice */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 text-sm text-gray-600 space-y-2">
        <p className="font-semibold text-gray-800">How to use these numbers</p>
        <p>
          <strong>Max capacity</strong> is the theoretical ceiling if everything goes perfectly.
          It never does.
        </p>
        <p>
          <strong>Recommended (80%)</strong> accounts for code reviews, unplanned meetings, small bugs,
          and the work that always appears mid-sprint. Commit to this number, not the max.
        </p>
        <p>
          <strong>Velocity (pts/day)</strong> varies by role and seniority. A reasonable default is 2 pts/day
          for a developer. Adjust based on your team&apos;s historical sprint data.
        </p>
      </div>
    </div>
  );
}
