"use client";

import { useActionState, useState, useEffect } from "react";
import { FormState, updateOrderStatus } from "../actions";
import { Button } from "@workspace/ui/components/button";
import {
  AlertCircleIcon,
  CheckCircle,
  CheckCircle2Icon,
  Loader2,
  Truck,
} from "lucide-react";
import { Alert, AlertTitle } from "@workspace/ui/components/alert";

const initialState: FormState = {
  success: false,
  error: null as string | null,
  message: "",
};

function ManagementForm({ order }: any) {
  const [state, formAction, isPending] = useActionState(
    updateOrderStatus.bind(null, order.id),
    initialState
  );

  return (
    <div className="space-y-4">
      {state?.message && (
        <Alert className="bg-green-100 text-green-800 border border-green-900">
          <CheckCircle2Icon />
          <AlertTitle>{state.message}</AlertTitle>
        </Alert>
      )}{" "}
      {state.error && (
        <Alert variant={"destructive"} className="bg-red-100">
          <AlertCircleIcon />
          <AlertTitle>{state.error}</AlertTitle>
        </Alert>
      )}
      <form action={formAction} className="flex flex-col gap-3">
        {order.status !== "pending" && (
          <Button
            name="status"
            className="w-full justify-start gap-2"
            value={"shippped"}
            disabled={
              order.status === "shipped" ||
              order.status === "delivered" ||
              isPending
            }
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Truck className="h-4 w-4" />
            )}
            Mark as Shipped
          </Button>
        )}

        {order.status !== "pending" && (
          <Button
            name="status"
            variant={"outline"}
            value={"delivered"}
            className="w-full justify-start gap-2"
            disabled={order.status === "delivered" || isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Mark as Delivered
          </Button>
        )}

        {order.status === "pending" && (
          <Button
            name="status"
            value={"paid"}
            variant={"outline"}
            className="w-full justify-start gap-2"
            disabled={order.status === "paid"}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}{" "}
            Mark as Paid
          </Button>
        )}
      </form>
    </div>
  );
}

export default ManagementForm;
