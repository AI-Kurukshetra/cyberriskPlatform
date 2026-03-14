"use client";

import type { ComponentProps, JSX } from "react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = ComponentProps<typeof Sonner>;

function Toaster(props: ToasterProps): JSX.Element {
  return <Sonner theme="light" position="top-right" richColors closeButton {...props} />;
}

export { Toaster };
