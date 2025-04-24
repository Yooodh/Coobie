type SenderMessageProps = {
  children: React.ReactNode;
};
export default function SenderMessage({ children }: SenderMessageProps) {
  return (
    <>
      {/* <div className="flex justify-start w-full"> */}
      <div className="flex items-end gap-2 w-full">{children}</div>
      {/* </div> */}
    </>
  );
}
