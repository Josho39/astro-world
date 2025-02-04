import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/10", className)}
      {...props}
    />
  )
}

function TableSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-6 w-[100px]" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex gap-4">
            <Skeleton className="h-4 flex-grow" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        </div>
      ))}
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="rounded-lg border border-muted p-6 shadow-sm">
      <div className="space-y-4">
        <Skeleton className="h-6 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[calc(100%-60px)]" />
          <Skeleton className="h-4 w-[calc(100%-120px)]" />
        </div>
      </div>
    </div>
  )
}

function TransactionSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-6 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  )
}

function AddressDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[300px]" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-6 w-[150px]" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-6 w-[120px]" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-[90px]" />
          <Skeleton className="h-6 w-[140px]" />
        </div>
      </div>
      <TableSkeleton />
    </div>
  )
}

export {
  Skeleton,
  TableSkeleton,
  CardSkeleton,
  TransactionSkeleton,
  AddressDetailsSkeleton
}