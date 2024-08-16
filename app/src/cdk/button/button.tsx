import { PropsWithChildren } from "react";

export type ButtonProps = PropsWithChildren & {};

export default function Button(props: ButtonProps) {
  const { children, ...rest } = props;
  return <button {...rest}>{children}</button>;
}
