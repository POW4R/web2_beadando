import { redirect } from "react-router";
import { getSession } from "~/lib/session.server";
import { prisma } from "~/lib/prisma.server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { Route } from "./+types/admin";
import { Users, Flag, Trophy, Mail, Database } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request);

  if (!session.userId || session.role !== "ADMIN") {
    throw redirect("/");
  }

  const [userCount, driverCount, gpCount, resultCount, contactCount] = await Promise.all([
    prisma.user.count(),
    prisma.driver.count(),
    prisma.gP.count(),
    prisma.result.count(),
    prisma.contact.count(),
  ]);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return {
    stats: {
      users: userCount,
      drivers: driverCount,
      gps: gpCount,
      results: resultCount,
      contacts: contactCount,
    },
    recentUsers: users,
  };
}

export default function AdminPage({ loaderData }: Route.ComponentProps) {
  const { stats, recentUsers } = loaderData;

  const statCards = [
    { label: "Users", value: stats.users, icon: <Users className="h-6 w-6 text-red-500" /> },
    { label: "Drivers", value: stats.drivers, icon: <Flag className="h-6 w-6 text-red-500" /> },
    { label: "Grand Prix", value: stats.gps, icon: <Trophy className="h-6 w-6 text-red-500" /> },
    { label: "Results", value: stats.results, icon: <Database className="h-6 w-6 text-red-500" /> },
    { label: "Messages", value: stats.contacts, icon: <Mail className="h-6 w-6 text-red-500" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-black text-white py-12 px-4">
      <div className="container mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold text-red-500 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 mt-3">
            Manage your F1 platform and view live system statistics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {statCards.map((item, i) => (
            <Card key={i} className="bg-neutral-900 border border-neutral-800 hover:border-red-500 transition-all rounded-xl shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold text-gray-200">{item.label}</CardTitle>
                {item.icon}
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-red-500">{item.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Users */}
        <Card className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-500">Recent Users</CardTitle>
            <CardDescription className="text-gray-400">
              Last 10 registered users
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="divide-y divide-neutral-800">
              {recentUsers.map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-4 hover:bg-neutral-800/40 transition-all px-2 rounded-lg"
                >
                  <div>
                    <div className="font-semibold text-gray-200">{user.email}</div>
                    <div className="text-sm text-gray-400">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <Badge
                    variant={user.role === "ADMIN" ? "destructive" : "default"}
                    className="uppercase tracking-wider"
                  >
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
