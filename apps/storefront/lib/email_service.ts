import { render } from "@react-email/components";
import nodemailer from "nodemailer";
import ReceiptEmail from "@workspace/ui/components/receipt-email";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "developerlexzee@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendEmailReceipt(order: any) {
  if (!order.profiles?.email) return;

  try {
    const emailHtml = await render(
      ReceiptEmail({
        orderId: order.id,
        date: new Date(order.created_at).toLocaleDateString(),
        customerName: order.profiles.full_name || "Valued Customer",
        customerEmail: order.profiles.email,
        shippingAddress: order.shipping_address, // Ensure your DB sends this as JSON
        items: order.items,
        totalAmount: order.total_amount,
      })
    );

    await transporter.sendMail({
      from: '"Scents by NurryO" <developerlexzee@gmail.com>',
      to: order.profiles.email,
      subject: `Payment Receipt: Order #${order.id.slice(0, 8)}`,
      html: emailHtml,
    });
    console.log(`📧 Receipt sent to ${order.profiles.email}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
}
