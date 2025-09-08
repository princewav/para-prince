import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Card as BaseCard, CardHeader as BaseCardHeader, CardContent as BaseCardContent, CardFooter as BaseCardFooter } from "./card";

const cardVariants = cva(
  "",
  {
    variants: {
      padding: {
        none: "py-0",
        xs: "py-2",
        sm: "py-3", 
        md: "py-4",
        lg: "py-6", // default
        xl: "py-8",
      },
    },
    defaultVariants: {
      padding: "lg",
    },
  }
);

const cardContentVariants = cva(
  "",
  {
    variants: {
      padding: {
        none: "px-0",
        xs: "px-2",
        sm: "px-3",
        md: "px-4", 
        lg: "px-6", // default
        xl: "px-8",
      },
    },
    defaultVariants: {
      padding: "lg",
    },
  }
);

const cardHeaderVariants = cva(
  "",
  {
    variants: {
      padding: {
        none: "px-0",
        xs: "px-2",
        sm: "px-3",
        md: "px-4",
        lg: "px-6", // default
        xl: "px-8",
      },
    },
    defaultVariants: {
      padding: "lg",
    },
  }
);

interface CardProps extends React.ComponentProps<typeof BaseCard>, VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding, ...props }, ref) => (
    <BaseCard
      ref={ref}
      className={cn(cardVariants({ padding }), className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

interface CardContentProps extends React.ComponentProps<typeof BaseCardContent>, VariantProps<typeof cardContentVariants> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, padding, ...props }, ref) => (
    <BaseCardContent
      ref={ref}
      className={cn(cardContentVariants({ padding }), className)}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

interface CardHeaderProps extends React.ComponentProps<typeof BaseCardHeader>, VariantProps<typeof cardHeaderVariants> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, padding, ...props }, ref) => (
    <BaseCardHeader
      ref={ref}
      className={cn(cardHeaderVariants({ padding }), className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

export { Card, CardContent, CardHeader, cardVariants, cardContentVariants, cardHeaderVariants };
export type { CardProps, CardContentProps, CardHeaderProps };