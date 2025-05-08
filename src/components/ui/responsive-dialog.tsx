"use client";

import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./drawer";

export function ResponsiveDialog({
  children,
  isOpen,
  isEditOpen,
  title,
  description,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  isEditOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  description?: string;
}) {
  // if (!isMobile) {
  return (
    <Dialog open={isOpen} onOpenChange={isEditOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
  // }

  // return (
  //   <Drawer open={isOpen} onOpenChange={isEditOpen}>
  //     <DrawerContent>
  //       <DrawerHeader className="text-left">
  //         <DrawerTitle>{title}</DrawerTitle>
  //         {description && <DialogDescription>{description}</DialogDescription>}
  //       </DrawerHeader>
  //       <div className="p-4">{children}</div>
  //       <DrawerFooter className="pt-2">
  //         <DrawerClose asChild>
  //           <Button variant="outline">Cancel</Button>
  //         </DrawerClose>
  //       </DrawerFooter>
  //     </DrawerContent>
  //   </Drawer>
  // );
}
