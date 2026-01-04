"use client";

import { useActionState, useState, useEffect } from "react";
import { FormState, updateOrderStatus } from "../actions";
import { Button } from "@workspace/ui/components/button";
import { CheckCircle, CheckCircle2Icon, Truck } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertTitle } from "@workspace/ui/components/alert";

const initialState: FormState = {
  success: false,
  error: null as string | null,
  message: "",
};

function ManagementForm({ order }: any) {
  const [status, setStatus] = useState("");
  const [state, formAction, isPending] = useActionState(
    updateOrderStatus.bind(null, order.id, status),
    initialState
  );

  return (
    <>
      {state.message ? (
        <Alert className="bg-green-100 text-green-800 border border-green-900">
          <CheckCircle2Icon />
          <AlertTitle>{state.message}</AlertTitle>
        </Alert>
      ) : (
        <Alert variant={"destructive"} className="bg-red-100">
          <CheckCircle2Icon />
          <AlertTitle>{state.error}</AlertTitle>
        </Alert>
      )}
      {order.status !== "pending" && (
        <form action={formAction}>
          <Button
            className="w-full justify-start gap-2"
            disabled={
              order.status === "shipped" || order.status === "delivered"
            }
            onClick={() => {
              setStatus("shipped");
            }}
          >
            <Truck className="h-4 w-4" /> Mark as Shipped
          </Button>
        </form>
      )}

      {order.status !== "pending" && (
        <form action={formAction}>
          <Button
            variant={"outline"}
            className="w-full justify-start gap-2"
            disabled={order.status === "delivered"}
            onClick={() => {
              setStatus("delivered");
            }}
          >
            <CheckCircle className="h-4 w-4" /> Mark as Delivered
          </Button>
        </form>
      )}
      {order.status === "pending" && (
        <form action={formAction}>
          <Button
            variant={"outline"}
            className="w-full justify-start gap-2"
            disabled={order.status === "paid"}
            onClick={() => {
              setStatus("paid");
            }}
          >
            <CheckCircle className="h-4 w-4" /> Mark as Paid
          </Button>
        </form>
      )}
    </>
  );
}

export default ManagementForm;
