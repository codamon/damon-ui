import { formatBytes, formatCents, formatMoney, formatPercent, moneyInputValue } from "@/registry/damon/lib/nz-money"

const rows: { call: string; result: string }[] = [
  { call: 'formatMoney("1234.5600")', result: formatMoney("1234.5600") },
  { call: 'formatMoney("15.0150")', result: formatMoney("15.0150") },
  { call: 'formatMoney("-400")', result: formatMoney("-400") },
  { call: 'formatMoney("99999999999999.995")', result: formatMoney("99999999999999.995") },
  { call: "formatMoney(null)", result: formatMoney(null) },
  { call: "formatCents(123456)", result: formatCents(123456) },
  { call: 'moneyInputValue("115.1234")', result: moneyInputValue("115.1234") },
  { call: "formatPercent(0.155)", result: formatPercent(0.155) },
  { call: "formatBytes(1572864)", result: formatBytes(1572864) },
]

export default function NzMoneyDemo() {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-left text-muted-foreground">
          <th className="py-2 font-medium">Call</th>
          <th className="py-2 text-right font-medium">Output</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.call} className="border-b last:border-0">
            <td className="py-2 font-mono text-xs">{row.call}</td>
            <td className="py-2 text-right font-mono tabular-nums">{row.result}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
