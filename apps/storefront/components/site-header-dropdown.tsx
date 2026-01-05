import { signout } from "@/app/auth/actions";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { ChevronDown, ChevronUpIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function MenuDropDown() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
      <DropdownMenuTrigger asChild onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <ChevronUpIcon size={20} /> : <ChevronDown size={20} />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem>
            {" "}
            <Link
              href="/orders"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              My Orders
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            {" "}
            <Link
              href="/account/profile"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Button
              variant={"ghost"}
              size={"sm"}
              onClick={() => signout().then()}
              className="p-1"
              // disabled
            >
              Log out
            </Button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
