"use client"
// components/ui/base/index.tsx
import useMediaQuery from "@/lib/hooks/use-media-query";
import { cn } from '@/lib/utils';
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import React, { Dispatch, forwardRef, ReactNode, SetStateAction, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Drawer } from "vaul";

// Base loading animation used across components
export const LoadingSpinner = () => (
	<Loader2 className="h-4 w-4 animate-spin" />
);

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
	if (!isOpen) return null;

	return createPortal(
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
			<div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-auto bg-white rounded-xl shadow-xl">
				{children}
			</div>
		</div>,
		document.body
	);
};

// Shared button variants following Notion's style
const buttonVariants = cva(
	"inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "bg-white text-gray-900 hover:bg-gray-50 border border-gray-200",
				primary: "bg-blue-600 text-white hover:bg-blue-700",
				ghost: "hover:bg-gray-100 hover:text-gray-900",
				text: "text-gray-600 hover:text-gray-900",
				danger: "bg-red-600 text-white hover:bg-red-700",
			},
			size: {
				sm: "h-8 px-3 text-xs",
				md: "h-9 px-4",
				lg: "h-10 px-6",
				icon: "h-9 w-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "md",
		},
	}
);

// Base Button component
export interface ButtonProps extends
	React.ButtonHTMLAttributes<HTMLButtonElement>,
	VariantProps<typeof buttonVariants> {
	isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
	className,
	variant,
	size,
	isLoading,
	children,
	...props
}, ref) => (
	<button
		className={cn(buttonVariants({ variant, size }), className)}
		ref={ref}
		disabled={isLoading || props.disabled}
		{...props}
	>
		{isLoading && <LoadingSpinner />}
		{children}
	</button>
));
Button.displayName = 'Button';

// Base Input component with Notion-like styling
export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({
	className,
	type = 'text',
	...props
}, ref) => (
	<input
		type={type}
		className={cn(
			"flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors",
			"file:border-0 file:bg-transparent file:text-sm file:font-medium",
			"placeholder:text-gray-500",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
			"disabled:cursor-not-allowed disabled:opacity-50",
			className
		)}
		ref={ref}
		{...props}
	/>
));
Input.displayName = 'Input';

// Base Card component
export const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
	className,
	children,
	...props
}, ref) => (
	<div
		ref={ref}
		className={cn(
			"rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md",
			className
		)}
		{...props}
	>
		{children}
	</div>
));
Card.displayName = 'Card';

// Checkbox with Notion-like styling
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
	className,
	label,
	...props
}, ref) => (
	<label className="flex items-center space-x-2">
		<input
			type="checkbox"
			ref={ref}
			className={cn(
				"h-4 w-4 rounded border-gray-300 text-blue-600",
				"focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
				"disabled:cursor-not-allowed disabled:opacity-50",
				className
			)}
			{...props}
		/>
		{label && <span className="text-sm text-gray-700">{label}</span>}
	</label>
));
Checkbox.displayName = 'Checkbox';

// Notion-style Modal backdrop and container
export const ModalBackdrop = ({
	children,
	onClose,
}: {
	children: React.ReactNode;
	onClose: () => void;
}) => (
	<div
		className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-20"
		role="dialog"
		aria-modal="true"
	>
		<div
			className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity"
			onClick={onClose}
		/>
		<div className="relative z-50 w-full max-w-lg transform rounded-lg bg-white shadow-2xl transition-all">
			{children}
		</div>
	</div>
);

// Notion-style Dropdown Menu
export interface DropdownProps {
	trigger: React.ReactNode;
	children: React.ReactNode;
	align?: 'start' | 'center' | 'end';
}

export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(({
	trigger,
	children,
	align = 'end',
}, ref) => (
	<div ref={ref} className="relative">
		{trigger}
		<div
			className={cn(
				"absolute z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg",
				{
					'left-0': align === 'start',
					'left-1/2 -translate-x-1/2': align === 'center',
					'right-0': align === 'end',
				}
			)}
		>
			{children}
		</div>
	</div>
));
Dropdown.displayName = 'Dropdown';

// Notion-style dialog component
export interface DialogProps {
	title: string;
	description?: string;
	children: React.ReactNode;
	onClose: () => void;
}

export const Dialog = ({ title, description, children, onClose }: DialogProps) => (
	<ModalBackdrop onClose={onClose}>
		<div className="relative mx-auto max-w-2xl">
			<div className="p-6">
				<h3 className="text-lg font-medium text-gray-900">{title}</h3>
				{description && (
					<p className="mt-2 text-sm text-gray-500">{description}</p>
				)}
				<div className="mt-4">{children}</div>
			</div>
			<div className="border-t border-gray-200 px-6 py-4">
				<div className="flex justify-end space-x-3">
					<Button variant="ghost" onClick={onClose}>Cancel</Button>
					<Button variant="primary">Confirm</Button>
				</div>
			</div>
		</div>
	</ModalBackdrop>
);

// Notion-style Toast notification
export interface ToastProps {
	title: string;
	description?: string;
	type?: 'default' | 'success' | 'error';
	onClose: () => void;
}

export const Toast = ({ title, description, type = 'default', onClose }: ToastProps) => (
	<div
		className={cn(
			"pointer-events-auto w-full max-w-sm rounded-lg shadow-lg",
			"bg-white ring-1 ring-black ring-opacity-5",
			"fixed bottom-4 right-4 z-50"
		)}
		role="alert"
	>
		<div className="p-4">
			<div className="flex items-start">
				<div className="flex-1">
					<p className="text-sm font-medium text-gray-900">{title}</p>
					{description && (
						<p className="mt-1 text-sm text-gray-500">{description}</p>
					)}
				</div>
				<button
					type="button"
					onClick={onClose}
					className="ml-4 inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
				>
					<span className="sr-only">Close</span>
					<svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
						<path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
					</svg>
				</button>
			</div>
		</div>
	</div>
);

export function Popover({
	children,
	content,
	align = "center",
	openPopover,
	setOpenPopover,
}: {
	children: ReactNode;
	content: ReactNode | string;
	align?: "center" | "start" | "end";
	openPopover: boolean;
	setOpenPopover: Dispatch<SetStateAction<boolean>>;
	mobileOnly?: boolean;
}) {
	const { isMobile } = useMediaQuery();

	if (isMobile) {
		return (
			<Drawer.Root open={openPopover} onOpenChange={setOpenPopover}>
				<div className="sm:hidden">{children}</div>
				<Drawer.Overlay className="fixed inset-0 z-40 bg-gray-100 bg-opacity-10 backdrop-blur" />
				<Drawer.Portal>
					<Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mt-24 rounded-t-[10px] border-t border-gray-200 bg-white">
						<div className="sticky top-0 z-20 flex w-full items-center justify-center rounded-t-[10px] bg-inherit">
							<div className="my-3 h-1 w-12 rounded-full bg-gray-300" />
						</div>
						<div className="flex min-h-[150px] w-full items-center justify-center overflow-hidden bg-white pb-8 align-middle shadow-xl">
							{content}
						</div>
					</Drawer.Content>
					<Drawer.Overlay />
				</Drawer.Portal>
			</Drawer.Root>
		);
	}

	return (
		<PopoverPrimitive.Root open={openPopover} onOpenChange={setOpenPopover}>
			<PopoverPrimitive.Trigger className="hidden sm:inline-flex" asChild>
				{children}
			</PopoverPrimitive.Trigger>
			<PopoverPrimitive.Portal>
				<PopoverPrimitive.Content
					sideOffset={8}
					align={align}
					className="z-50 hidden animate-slide-up-fade items-center rounded-md border border-gray-200 bg-white drop-shadow-lg sm:block"
				>
					{content}
				</PopoverPrimitive.Content>
			</PopoverPrimitive.Portal>
		</PopoverPrimitive.Root>
	);
}

export function CountingNumbers({
	value,
	className,
	start = 0,
	duration = 800,
}: {
	value: number;
	className: string;
	start?: number;
	duration?: number;
}) {
	const [count, setCount] = useState(start);

	useEffect(() => {
		let startTime: number | undefined;
		const animateCount = (timestamp: number) => {
			if (!startTime) startTime = timestamp;
			const timePassed = timestamp - startTime;
			const progress = timePassed / duration;
			const currentCount = easeOutQuad(progress, 0, value, 1);
			if (currentCount >= value) {
				setCount(value);
				return;
			}
			setCount(currentCount);
			requestAnimationFrame(animateCount);
		};
		requestAnimationFrame(animateCount);
	}, [value, duration]);

	return <p className={className}>{Intl.NumberFormat().format(count)}</p>;
}
const easeOutQuad = (t: number, b: number, c: number, d: number) => {
	t = t > d ? d : t / d;
	return Math.round(-c * t * (t - 2) + b);
};
