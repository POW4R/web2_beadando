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

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const data = {
      name: formData.get("name") as string,
      sex: formData.get("sex") as string,
      birthDate: new Date(formData.get("birthDate") as string),
      country: formData.get("country") as string,
    };

    const result = driverSchema.safeParse({ ...data, birthDate: formData.get("birthDate") as string });
    if (!result.success) {
      return { success: false, errors: result.error.flatten().fieldErrors };
    }

    await driverRepository.create(data);
    return { success: true, message: "Driver created successfully" };
  }

  if (intent === "update") {
    const id = parseInt(formData.get("id") as string);
    const data = {
      name: formData.get("name") as string,
      sex: formData.get("sex") as string,
      birthDate: new Date(formData.get("birthDate") as string),
      country: formData.get("country") as string,
    };

    const result = driverSchema.safeParse({ ...data, birthDate: formData.get("birthDate") as string });
    if (!result.success) {
      return { success: false, errors: result.error.flatten().fieldErrors };
    }

    await driverRepository.update(id, data);
    return { success: true, message: "Driver updated successfully" };
  }

  if (intent === "delete") {
    const id = parseInt(formData.get("id") as string);
    await driverRepository.delete(id);
    return { success: true, message: "Driver deleted successfully" };
  }

  return { success: false, message: "Invalid action" };
}

function DriverForm({ 
  driver, 
  onSuccess 
}: { 
  driver?: Driver; 
  onSuccess: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: driver ? {
      name: driver.name,
      sex: driver.sex as "M" | "F",
      birthDate: format(new Date(driver.birthDate), "yyyy-MM-dd"),
      country: driver.country,
    } : undefined,
  });

  const fetcher = useFetcher<typeof action>();

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
      toast.success(fetcher.data.message || (driver ? "Driver updated successfully" : "Driver created successfully"));
      onSuccess();
    } else if (fetcher.data?.success === false) {
      if (fetcher.data.errors) {
        Object.values(fetcher.data.errors).forEach((errorMessages) => {
          errorMessages?.forEach((message) => {
            toast.error(message);
          }
          );
        });
      };
    }
  }, [fetcher.data, onSuccess, driver]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input id="name" {...register("name")} />
          {errors.name && (
            <FieldDescription className="text-destructive">
              {errors.name.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="sex">Sex</FieldLabel>
          <Input id="sex" placeholder="M or F" {...register("sex")} />
          {errors.sex && (
            <FieldDescription className="text-destructive">
              {errors.sex.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="birthDate">Birth Date</FieldLabel>
          <Input id="birthDate" type="date" {...register("birthDate")} />
          {errors.birthDate && (
            <FieldDescription className="text-destructive">
              {errors.birthDate.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="country">Country</FieldLabel>
          <Input id="country" {...register("country")} />
          {errors.country && (
            <FieldDescription className="text-destructive">
              {errors.country.message}
            </FieldDescription>
          )}
        </Field>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : driver ? "Update Driver" : "Create Driver"}
        </Button>
      </FieldGroup>
    </form>
  );
}

export default function CRUDPage({ loaderData }: Route.ComponentProps) {
  const { drivers } = loaderData;
  const [open, setOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | undefined>();

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this driver?")) return;

    const formData = new FormData();
    formData.append("intent", "delete");
    formData.append("id", id.toString());

    const response = await fetch("/crud", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      toast.success(result.message);
      window.location.reload();
    } else {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Driver Management (CRUD)</CardTitle>
              <CardDescription>
                Create, Read, Update, and Delete driver records
              </CardDescription>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingDriver(undefined)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Driver
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingDriver ? "Edit Driver" : "Add New Driver"}</DialogTitle>
                  <DialogDescription>
                    {editingDriver ? "Update driver information" : "Enter new driver details"}
                  </DialogDescription>
                </DialogHeader>
                <DriverForm driver={editingDriver} onSuccess={() => setOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((driver: Driver) => (
                <TableRow key={driver.id}>
                  <TableCell>{driver.id}</TableCell>
                  <TableCell className="font-medium">{driver.name}</TableCell>
                  <TableCell>{driver.sex}</TableCell>
                  <TableCell>{format(new Date(driver.birthDate), "PPP")}</TableCell>
                  <TableCell>{driver.country}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
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
        </CardContent>
      </Card>
    </div>
  );
}
