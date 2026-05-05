"use client";

import * as React from "react";

import { cn } from "./utils";

type SelectItemData = {
  value: string;
  label: string;
  disabled?: boolean;
};

interface SelectContextType {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  placeholder?: React.ReactNode;
  items: SelectItemData[];
  registerItem: (item: SelectItemData) => void;
  unregisterItem: (value: string) => void;
  setPlaceholder: (placeholder?: React.ReactNode) => void;
}

const SelectContext = React.createContext<SelectContextType | null>(null);

function useSelectContext(component: string) {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error(`${component} must be used inside a Select`);
  }
  return context;
}

function Select({
  children,
  value,
  defaultValue,
  onValueChange,
  name,
  disabled,
  required,
  autoComplete,
  form,
  ...props
}: {
  children?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  form?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const [items, setItems] = React.useState<SelectItemData[]>([]);
  const [placeholder, setPlaceholder] = React.useState<React.ReactNode>();
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");

  React.useEffect(() => {
    setInternalValue(defaultValue ?? "");
  }, [defaultValue]);

  const registerItem = React.useCallback((item: SelectItemData) => {
    setItems((currentItems) => {
      const nextItems = currentItems.filter((current) => current.value !== item.value);
      return [...nextItems, item];
    });
  }, []);

  const unregisterItem = React.useCallback((itemValue: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.value !== itemValue));
  }, []);

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      onValueChange?.(newValue);
      if (value === undefined) {
        setInternalValue(newValue);
      }
    },
    [onValueChange, value],
  );

  const contextValue = React.useMemo(
    () => ({
      value: value !== undefined ? value : internalValue,
      onValueChange: handleValueChange,
      name,
      disabled,
      placeholder,
      items,
      registerItem,
      unregisterItem,
      setPlaceholder,
    }),
    [value, internalValue, handleValueChange, name, disabled, placeholder, items, registerItem, unregisterItem],
  );

  return (
    <SelectContext.Provider value={contextValue}>
      <div data-slot="select" {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

function SelectTrigger({
  className,
  size = "default",
  ...props
}: React.ComponentPropsWithoutRef<"select"> & {
  size?: "sm" | "default";
}) {
  const context = useSelectContext("SelectTrigger");

  return (
    <select
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 w-full rounded-md border bg-input-background px-3 py-2 text-sm text-current outline-none transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8",
        className,
      )}
      value={context.value ?? ""}
      onChange={(event) => context.onValueChange?.(event.target.value)}
      name={context.name}
      disabled={context.disabled}
      aria-disabled={context.disabled}
      {...props}
    >
      {context.placeholder && (!context.value || context.value === "") && (
        <option value="" disabled hidden>
          {context.placeholder}
        </option>
      )}
      {context.items.map((item) => (
        <option key={item.value} value={item.value} disabled={item.disabled}>
          {item.label}
        </option>
      ))}
    </select>
  );
}

function SelectContent({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="select-content" style={{ display: "none" }} {...props}>
      {children}
    </div>
  );
}

function SelectValue({ placeholder }: { placeholder?: React.ReactNode }) {
  const context = useSelectContext("SelectValue");

  React.useEffect(() => {
    context.setPlaceholder(placeholder);
    return () => {
      context.setPlaceholder(undefined);
    };
  }, [context, placeholder]);

  return null;
}

function SelectGroup({
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div data-slot="select-group" {...props} />;
}

function SelectItem({
  value,
  disabled,
  children,
}: {
  value: string;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  const context = useSelectContext("SelectItem");

  const label = React.useMemo(
    () =>
      React.Children.toArray(children)
        .map((child) =>
          typeof child === "string" || typeof child === "number"
            ? child
            : "",
        )
        .join(""),
    [children],
  );

  React.useEffect(() => {
    context.registerItem({ value, label, disabled });
    return () => {
      context.unregisterItem(value);
    };
  }, [context, value, label, disabled]);

  return null;
}

function SelectLabel({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div data-slot="select-label" className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)} {...props} />
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div data-slot="select-separator" className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)} {...props} />;
}

function SelectScrollUpButton() {
  return null;
}

function SelectScrollDownButton() {
  return null;
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
