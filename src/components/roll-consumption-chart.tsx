"use client"

import type { Roll } from "@/lib/types"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface RollConsumptionChartProps {
  data: Roll[]
}

const chartConfig = {
  comprimento_atual_metros: {
    label: "Papel Restante (m)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function RollConsumptionChart({ data }: RollConsumptionChartProps) {
    const chartData = data.map(roll => ({
        name: roll.nome_rolo,
        comprimento_atual_metros: parseFloat(roll.comprimento_atual_metros.toFixed(2)),
    }));

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 15)}
        />
        <YAxis
            tickFormatter={(value) => `${value}m`}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar
          dataKey="comprimento_atual_metros"
          fill="var(--color-comprimento_atual_metros)"
          radius={4}
        />
      </BarChart>
    </ChartContainer>
  )
}
