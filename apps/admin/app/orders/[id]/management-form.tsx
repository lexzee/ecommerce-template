"use client";

import { useActionState } from "react";
import { FormState, updateOrderStatus } from "../actions";
import { Button } from "@workspace/ui/components/button";
import { CheckCircle, Truck } from "lucide-react";

const initialState: FormState = {
  success: false,
  error: null as string | null,
  message: "",
};

function ManagementForm({ order }: any) {
  const [state1, formAction1, isPending1] = useActionState(
    updateOrderStatus.bind(null, order.id, "shipped"),
    initialState
  );
  const [state2, formAction2, isPending2] = useActionState(
    updateOrderStatus.bind(null, order.id, "delivered"),
    initialState
  );
  return (
    <>
      {state1.success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm border border-green-200">
          {state1.message}
        </div>
      )}
      {state1.error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
          {state1.error}
        </div>
      )}
      <form action={formAction1}>
        <Button
          className="w-full justify-start gap-2"
          disabled={order.status === "shipped" || order.status === "delivered"}
        >
          <Truck className="h-4 w-4" /> Mark as Shipped
        </Button>
      </form>

      {state2.success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm border border-green-200">
          {state2.message}
        </div>
      )}
      {state2.error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
          {state2.error}
        </div>
      )}
      <form action={formAction2}>
        <Button
          variant={"outline"}
          className="w-full justify-start gap-2"
          disabled={order.status === "delivered"}
        >
          <CheckCircle className="h-4 w-4" /> Mark as Delivered
        </Button>
      </form>
    </>
  );
}

export default ManagementForm;
