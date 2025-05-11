import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";
import Image from "next/image";

export default function CommentCard({
  name,
  createdAt,
  text,
  image,
}: {
  name?: string;
  createdAt: Date;
  text: string | null;
  image?: string | null;
}) {
  return (
    <div className="flex w-full gap-5">
      <div className="relative size-10">
        <Image
          src={image ?? ""}
          alt="profile img"
          fill
          className="rounded-full"
        />
      </div>
      <Card className="border-primary flex-1 rounded-md border p-0">
        <CardHeader className="bg-primary/20 border-primary flex items-center justify-between rounded-t-md border-b p-2">
          <div className="flex items-center gap-2">
            <CardTitle>{name}</CardTitle>
            <CardDescription>{createdAt.toLocaleDateString()}</CardDescription>
          </div>
          <div>
            <MoreHorizontal />
          </div>
        </CardHeader>
        <CardContent className="p-2">
          <div>{text}</div>
        </CardContent>
      </Card>
    </div>
  );
}
