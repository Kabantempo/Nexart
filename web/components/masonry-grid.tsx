'use client'

import * as React from 'react'
import { motion } from 'framer-motion'

interface MasonryGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: number
  gap?: number
}

const MasonryGrid = React.forwardRef<HTMLDivElement, MasonryGridProps>(
  ({ className, columns = 3, gap = 4, children, ...props }, ref) => {
    const style = {
      columnCount: columns,
      columnGap: `${gap * 0.25}rem`,
    }

    const cardVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          ease: 'easeOut',
        },
      },
    }

    return (
      <div ref={ref} style={style} className={className} {...props}>
        {React.Children.map(children, (child) => (
          <motion.div
            style={{ marginBottom: `${gap * 0.25}rem`, breakInside: 'avoid' }}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {child}
          </motion.div>
        ))}
      </div>
    )
  }
)

MasonryGrid.displayName = 'MasonryGrid'

export { MasonryGrid }
