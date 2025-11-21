import { redirect } from "react-router";
import { contactRepository } from "~/lib/repositories/contact.repository";
import { getSession } from "~/lib/session.server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { format } from "date-fns";
import type { Route } from "./+types/messages";

interface Message {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export async function loader({ request }: Route.LoaderArgs): Promise<{ messages: Message[]; user: any }> {
  const session = await getSession(request);

  if (!session.userId) {
    throw redirect("/login");
  }

  const rawMessages = await contactRepository.findAll();

  // Normalize repository data to match the Message interface (id as string, createdAt as ISO string)
  const messages: Message[] = rawMessages.map((m) => ({
    id: String(m.id),
    createdAt:
      m.createdAt instanceof Date ? m.createdAt.toISOString() : new Date(m.createdAt).toISOString(),
    name: m.name,
    email: m.email,
    subject: m.subject,
    message: m.message,
  }));

  return { messages, user: session };
}

// 🔥 Add this — the key to fix TS!
export type LoaderData = Awaited<ReturnType<typeof loader>>;


export default function MessagesPage({
  loaderData,
}: Route.ComponentProps & { loaderData: LoaderData }) {

  const messages = (loaderData as LoaderData).messages;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-black text-white py-12 px-4">
      <div className="container mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-red-500">
            Contact Messages
          </h1>
          <p className="text-gray-400 mt-2">
            All contact form submissions (newest first)
          </p>
        </div>

        {/* Card Wrapper */}
        <Card className="bg-neutral-900 border border-neutral-800 shadow-xl rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-500">
              Messages
            </CardTitle>
            <CardDescription className="text-gray-400">
              Centralized view of all incoming messages
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Empty State */}
            {messages.length === 0 ? (
              <div className="text-center py-16 text-gray-500 text-lg">
                <div className="opacity-60">No messages yet</div>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-neutral-800">
                <Table>
                  <TableHeader className="bg-neutral-800/50">
                    <TableRow>
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-300">Email</TableHead>
                      <TableHead className="text-gray-300">Subject</TableHead>
                      <TableHead className="text-gray-300">Message</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {messages.map((message) => (
                      <TableRow key={message.id} className="hover:bg-neutral-800/40 transition-all">
                        <TableCell className="whitespace-nowrap text-gray-200">
                          {format(new Date(message.createdAt), "PPpp")}
                        </TableCell>

                        <TableCell className="font-semibold text-red-400">
                          {message.name}
                        </TableCell>

                        <TableCell className="text-gray-300">{message.email}</TableCell>

                        <TableCell className="text-gray-300">{message.subject}</TableCell>

                        <TableCell className="max-w-md truncate text-gray-400">
                          {message.message}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
