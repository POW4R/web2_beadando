import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { driverRepository } from "~/lib/repositories/driver.repository";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { Route } from "./+types/crud";
import type { Driver } from "@prisma/client";
import { useFetcher } from "react-router";

const driverSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  sex: z.enum(["M", "F"], { message: "Sex must be M or F" }),
  birthDate: z.string().min(1, "Birth date is required"),
  country: z.string().min(2, "Country must be at least 2 characters"),
});

type DriverFormData = z.infer<typeof driverSchema>;

export async function loader({}: Route.LoaderArgs) {
  const drivers = await driverRepository.findAll();
  return { drivers };
}

// -----------------------------------------------------------------------------
// DRIVER FORM (MODERN DESIGN)
// -----------------------------------------------------------------------------

function DriverForm({ driver, onSuccess }: { driver?: Driver; onSuccess: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: driver ? {
      name: driver.name,
      sex: driver.sex as "M" | "F",
      birthDate: format(new Date(driver.birthDate), "yyyy-MM-dd"),
      country: driver.country,
    } : undefined,
  });

  const fetcher = useFetcher();

  const onSubmit = async (data: DriverFormData) => {
    const formData = new FormData();
    formData.append("intent", driver ? "update" : "create");
    if (driver) formData.append("id", driver.id.toString());
    formData.append("name", data.name);
    formData.append("sex", data.sex);
    formData.append("birthDate", data.birthDate);
    formData.append("country", data.country);

    await fetcher.submit(formData, { method: "post" });
  };

  useEffect(() => {
    if (fetcher.data?.success) {
      toast.success(fetcher.data.message || "Success");
      onSuccess();
    } else if (fetcher.data?.errors) {
      Object.values(fetcher.data.errors).forEach((messages) => {
        messages?.forEach((msg) => toast.error(msg));
      });
    }
  }, [fetcher.data, onSuccess]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup className="grid gap-4">
        <Field>
          <FieldLabel>Name</FieldLabel>
          <Input {...register("name")} className="bg-neutral-900 border-neutral-700 text-white" />
          {errors.name && <FieldDescription className="text-red-500">{errors.name.message}</FieldDescription>}
        </Field>

        <Field>
          <FieldLabel>Sex</FieldLabel>
          <Input {...register("sex")} placeholder="M or F" className="bg-neutral-900 border-neutral-700 text-white" />
          {errors.sex && <FieldDescription className="text-red-500">{errors.sex.message}</FieldDescription>}
        </Field>

        <Field>
          <FieldLabel>Birth Date</FieldLabel>
          <Input type="date" {...register("birthDate")} className="bg-neutral-900 border-neutral-700 text-white" />
          {errors.birthDate && <FieldDescription className="text-red-500">{errors.birthDate.message}</FieldDescription>}
        </Field>

        <Field>
          <FieldLabel>Country</FieldLabel>
          <Input {...register("country")} className="bg-neutral-900 border-neutral-700 text-white" />
          {errors.country && <FieldDescription className="text-red-500">{errors.country.message}</FieldDescription>}
        </Field>
      </FieldGroup>

      <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
        {isSubmitting ? "Saving..." : driver ? "Update Driver" : "Create Driver"}
      </Button>
    </form>
  );
}

// -----------------------------------------------------------------------------
// MAIN CRUD PAGE (FULL REDESIGN)
// -----------------------------------------------------------------------------

export default function CRUDPage({ loaderData }: Route.ComponentProps) {
  const { drivers } = loaderData;
  const [open, setOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | undefined>();

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;

    const formData = new FormData();
    formData.append("intent", "delete");
    formData.append("id", id.toString());

    const response = await fetch("/crud", { method: "POST", body: formData });
    const result = await response.json();

    if (result.success) {
      toast.success(result.message);
      window.location.reload();
    } else toast.error("Delete failed");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-black text-white py-12 px-4">

      <div className="container mx-auto max-w-6xl">
        <Card className="bg-neutral-900 border-neutral-800 shadow-xl rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl text-red-500">Driver Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Create, Read, Update & Delete Formula 1 drivers
                </CardDescription>
              </div>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => setEditingDriver(undefined)}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Driver
                  </Button>
                </DialogTrigger>

                <DialogContent className="bg-neutral-900 border border-neutral-700 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-red-500">
                      {editingDriver ? "Edit Driver" : "Add New Driver"}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      {editingDriver ? "Update the selected driver" : "Fill in the fields below"}
                    </DialogDescription>
                  </DialogHeader>

                  <DriverForm driver={editingDriver} onSuccess={() => setOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-neutral-800">
              <Table>
                <TableHeader className="bg-neutral-800/50">
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Sex</TableHead>
                    <TableHead>Birth Date</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {drivers.map((driver: Driver) => (
                    <TableRow key={driver.id} className="hover:bg-neutral-800/40">
                      <TableCell>{driver.id}</TableCell>
                      <TableCell className="font-semibold text-red-400">{driver.name}</TableCell>
                      <TableCell>{driver.sex}</TableCell>
                      <TableCell>{format(new Date(driver.birthDate), "PPP")}</TableCell>
                      <TableCell>{driver.country}</TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">

                          <Button
                            variant="outline"
                            size="sm"
                            className="border-neutral-700 text-gray-300 hover:border-red-500"
                            onClick={() => {
                              setEditingDriver(driver);
                              setOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleDelete(driver.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
