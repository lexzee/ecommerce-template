export default function AuthLayou({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <div className="mx-auto grid w-[350px] gap-6">{children}</div>
    </div>
  );
}
