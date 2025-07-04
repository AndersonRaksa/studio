import type { Roll } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from 'date-fns';

interface RollCardProps {
  roll: Roll;
}

export function RollCard({ roll }: RollCardProps) {
  const percentage = (roll.comprimento_atual_metros / roll.comprimento_inicial_metros) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-xl">{roll.nome_rolo}</CardTitle>
            <Badge variant={roll.ativo ? "secondary" : "destructive"} className="capitalize">
                {roll.ativo ? "Ativo" : "Esgotado"}
            </Badge>
        </div>
        <CardDescription>Comprado em {format(roll.data_compra, "dd/MM/yyyy")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
            <div className="flex justify-between items-end mb-1">
                <span className="text-sm text-muted-foreground">Papel Restante</span>
                <span className="font-medium font-mono text-primary/90">
                    {roll.comprimento_atual_metros.toFixed(2)}m / {roll.comprimento_inicial_metros}m
                </span>
            </div>
            <Progress value={percentage} aria-label={`${percentage.toFixed(0)}% restante`} />
        </div>
        {roll.observacoes && (
             <p className="text-sm text-muted-foreground pt-2 border-t mt-4">
                <strong>Obs:</strong> {roll.observacoes}
            </p>
        )}
      </CardContent>
    </Card>
  );
}
