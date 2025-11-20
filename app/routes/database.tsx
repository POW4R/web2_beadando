import { driverRepository } from "~/lib/repositories/driver.repository";
import { gpRepository } from "~/lib/repositories/gp.repository";
import { resultRepository } from "~/lib/repositories/result.repository";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { format } from "date-fns";
import type { Route } from "./+types/database";

export async function loader({}: Route.LoaderArgs) {
  const [drivers, gps, results] = await Promise.all([
    driverRepository.findAll(),
    gpRepository.findAll(),
    resultRepository.findAll(),
  ]);

  return { drivers, gps, results };
}

export default function DatabasePage({ loaderData }: Route.ComponentProps) {
  const { drivers, gps, results } = loaderData;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Database Overview</h1>
        <p className="text-muted-foreground">
          View data from Driver, GP, and Result tables
        </p>
      </div>

      <Tabs defaultValue="drivers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="drivers">Drivers ({drivers.length})</TabsTrigger>
          <TabsTrigger value="gps">Grand Prix ({gps.length})</TabsTrigger>
          <TabsTrigger value="results">Results ({results.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="drivers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Formula 1 Drivers</CardTitle>
              <CardDescription>List of all drivers in the database</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Sex</TableHead>
                    <TableHead>Birth Date</TableHead>
                    <TableHead>Country</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell>{driver.id}</TableCell>
                      <TableCell className="font-medium">{driver.name}</TableCell>
                      <TableCell>{driver.sex}</TableCell>
                      <TableCell>{format(new Date(driver.birthDate), "PPP")}</TableCell>
                      <TableCell>{driver.country}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gps" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Grand Prix Events</CardTitle>
              <CardDescription>List of all GP races in the database</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Country</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gps.map((gp) => (
                    <TableRow key={gp.date.toString()}>
                      <TableCell>{format(new Date(gp.date), "PPP")}</TableCell>
                      <TableCell className="font-medium">{gp.name}</TableCell>
                      <TableCell>{gp.country}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Race Results</CardTitle>
              <CardDescription>List of all race results in the database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>GP</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Engine</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">{result.gp.name}</TableCell>
                        <TableCell>{format(new Date(result.gpDate), "PP")}</TableCell>
                        <TableCell>{result.driver.name}</TableCell>
                        <TableCell>
                          {result.position ? (
                            <span className="font-semibold">{result.position}</span>
                          ) : (
                            <span className="text-muted-foreground">DNF</span>
                          )}
                        </TableCell>
                        <TableCell>{result.team || "-"}</TableCell>
                        <TableCell>{result.engine || "-"}</TableCell>
                        <TableCell>{result.type || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
