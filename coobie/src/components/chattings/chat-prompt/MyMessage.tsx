type MyMessageProps = {
  children: React.ReactNode;
};
export default function MyMessage({ children }: MyMessageProps) {
  return (
    <>
      <div className="flex justify-end w-full">
        <div className="flex items-end gap-2">{children}</div>
      </div>
    </>
  );
}
