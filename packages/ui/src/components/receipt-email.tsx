import {
  Body,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface ReceiptEmailProps {
  orderId: string;
  date: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: any;
  items: any[];
  totalAmount: number;
}

export const ReceiptEmail = ({
  orderId,
  date,
  customerName,
  customerEmail,
  shippingAddress,
  items,
  totalAmount,
}: ReceiptEmailProps) => {
  const formattedTotal = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(totalAmount);

  return (
    <Html>
      <Head />
      <Preview>Your Receipt for Order #{orderId.slice(0, 8)}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Text className="text-black text-[24px] font-bold text-center p-0 my-[30px] mx-0 uppercase tracking-widest">
                SCENTS BY NURRYO
              </Text>
              <Text className="text-black text-[14px] leading-[24px] text-center">
                Thank you for your purchase!
              </Text>
            </Section>

            <Section className="px-4">
              <Row>
                <Column>
                  <Text className="text-gray-500 text-xs uppercase font-bold">
                    Bill To
                  </Text>
                  <Text className="text-sm font-medium m-0">
                    {customerName}
                  </Text>
                  <Text className="text-sm m-0 text-gray-500">
                    {customerEmail}
                  </Text>
                </Column>
                <Column align="right">
                  <Text className="text-gray-500 text-xs uppercase font-bold">
                    Receipt
                  </Text>
                  <Text className="text-sm m-0">#{orderId.slice(0, 8)}</Text>
                  <Text className="text-sm m-0 text-gray-500">{date}</Text>
                </Column>
              </Row>
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            <Section>
              {items.map((item) => (
                <Row key={item.id} className="mb-4">
                  <Column>
                    <Text className="text-sm font-bold m-0">
                      {item.product_name || item.products?.name}
                    </Text>
                    <Text className="text-xs text-gray-500 m-0">
                      Qty: {item.quantity}
                    </Text>
                  </Column>
                  <Column align="right">
                    <Text className="text-sm font-medium m-0">
                      {new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: "NGN",
                      }).format((item.unit_price || 0) * item.quantity)}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            <Section>
              <Row>
                <Column>
                  <Text className="text-base font-bold m-0">TOTAL</Text>
                </Column>
                <Column align="right">
                  <Text className="text-xl font-bold m-0">
                    {formattedTotal}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Section className="mt-8 text-center">
              <Text className="text-[12px] text-gray-500">
                123 Commerce St, Lagos, Nigeria <br />
                support@scentsbynurryo.com
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ReceiptEmail;
