"use client";

import { CaretDownIcon, CheckIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import * as React from "react";
import { Popover } from "radix-ui";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SearchableSelectOption = {
  value: string;
  label: string;
  keywords?: string;
  disabled?: boolean;
};

type SearchableSelectProps = {
  options: readonly SearchableSelectOption[];
  value?: string;
  onValueChange(value: string): void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

export const SearchableSelect = React.forwardRef<HTMLButtonElement, SearchableSelectProps>(function SearchableSelect(
  {
    options,
    value = "",
    onValueChange,
    placeholder = "Select an option",
    searchPlaceholder = "Search options…",
    emptyMessage = "No options found.",
    disabled,
    required,
    name,
    id,
    className,
    onBlur,
    ...ariaProps
  },
  ref,
) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const selected = options.find((option) => option.value === value);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filtered = normalizedQuery
    ? options.filter((option) => `${option.label} ${option.keywords ?? ""}`.toLocaleLowerCase().includes(normalizedQuery))
    : options;

  function select(nextValue: string) {
    onValueChange(nextValue);
    setOpen(false);
    setQuery("");
  }

  return (
    <Popover.Root open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (!nextOpen) setQuery(""); }}>
      {name ? <input type="hidden" name={name} value={value} required={required} disabled={disabled} /> : null}
      <Popover.Trigger asChild>
        <Button
          ref={ref}
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          aria-required={required}
          onBlur={onBlur}
          className={cn("h-11 w-full justify-between bg-white px-3 font-normal", !selected && "text-muted-foreground", className)}
          {...ariaProps}
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
          <CaretDownIcon aria-hidden className="ml-2 size-4 shrink-0 opacity-60" />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className="z-50 w-(--radix-popover-trigger-width) rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <div className="relative p-1">
            <MagnifyingGlassIcon aria-hidden className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="h-9 pl-8"
            />
          </div>
          <div role="listbox" aria-label={ariaProps["aria-label"] ?? placeholder} className="max-h-64 overflow-y-auto p-1">
            {filtered.length ? filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                disabled={option.disabled}
                onClick={() => select(option.value)}
                className="flex w-full items-center rounded-sm px-2 py-2 text-left text-sm outline-none hover:bg-accent focus-visible:bg-accent disabled:pointer-events-none disabled:opacity-50"
              >
                <CheckIcon aria-hidden className={cn("mr-2 size-4 shrink-0", option.value === value ? "opacity-100" : "opacity-0")} />
                <span className="truncate">{option.label}</span>
              </button>
            )) : <p className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
});
