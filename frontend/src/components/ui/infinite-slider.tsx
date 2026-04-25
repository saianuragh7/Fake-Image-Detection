import { motion } from "motion/react"
import { type ReactNode, useMemo } from "react"
import useMeasure from "react-use-measure"
import { cn } from "../../lib/utils"

type InfiniteSliderProps = {
  children: ReactNode
  className?: string
  speed?: number
  gapClassName?: string
}

export function InfiniteSlider({
  children,
  className,
  speed = 70,
  gapClassName = "gap-10 sm:gap-16",
}: InfiniteSliderProps) {
  const [measureRef, bounds] = useMeasure()

  const duration = useMemo(() => {
    if (!bounds.width) {
      return 18
    }

    return Math.max(bounds.width / speed, 10)
  }, [bounds.width, speed])

  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <motion.div
        className={cn("flex min-w-max items-center", gapClassName)}
        animate={{ x: [0, -bounds.width] }}
        transition={{
          duration,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        }}
      >
        <div ref={measureRef} className={cn("flex shrink-0 items-center", gapClassName)}>
          {children}
        </div>
        <div aria-hidden className={cn("flex shrink-0 items-center", gapClassName)}>
          {children}
        </div>
      </motion.div>
    </div>
  )
}
