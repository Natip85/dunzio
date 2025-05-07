import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateProjectForm from "@/features/projects/create-project-form";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export default function ProjectsPage() {
  return (
    <div className="flex flex-1 flex-col gap-5 p-2 md:p-5">
      <div>
        <Card className="mx-auto max-w-7xl">
          <CardHeader>
            <CardTitle>Welcome to projects</CardTitle>
            <CardDescription className="w-1/2">
              Built like a spreadsheet, project tables give you a live canvas to
              filter, sort, and group issues and pull requests. Tailor them to
              your needs with custom fields and saved views.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href={"#"} className={buttonVariants({ variant: "outline" })}>
              Learn more
            </Link>
          </CardFooter>
        </Card>
      </div>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="bg-green-600 text-white hover:bg-green-700 hover:text-white"
            >
              <PlusIcon /> Create project
            </Button>
          </DialogTrigger>
          <DialogContent className="flex flex-col gap-5 p-8 sm:flex-row">
            <DialogHeader className="w-full sm:w-1/3">
              <DialogTitle className="text-start">New project</DialogTitle>
              <DialogDescription className="text-start">
                Start with a board to spread your issues and pull requests
                across customizable columns.
              </DialogDescription>
            </DialogHeader>
            <div className="w-full">
              <CreateProjectForm />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
