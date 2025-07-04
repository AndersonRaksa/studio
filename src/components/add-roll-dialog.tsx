"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CalendarIcon, PlusCircle } from "lucide-react"
import { format } from "date-fns"

import { useFilmData } from "@/contexts/film-data-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const addRollSchema = z.object({
  nome_rolo: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  data_compra: z.date({ required_error: "A data de compra é obrigatória." }),
  comprimento_inicial_metros: z.coerce.number().positive({ message: "O comprimento deve ser um número positivo." }).default(93),
  largura_cm: z.coerce.number().positive({ message: "A largura deve ser um número positivo." }).default(30),
  observacoes: z.string().optional(),
})

export function AddRollDialog() {
  const [open, setOpen] = useState(false)
  const { addRoll } = useFilmData()
  const form = useForm<z.infer<typeof addRollSchema>>({
    resolver: zodResolver(addRollSchema),
    defaultValues: {
      nome_rolo: "",
      comprimento_inicial_metros: 93,
      largura_cm: 30,
      observacoes: "",
    },
  })

  function onSubmit(values: z.infer<typeof addRollSchema>) {
    addRoll(values)
    form.reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" />
          Adicionar Rolo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Rolo</DialogTitle>
          <DialogDescription>
            Preencha os detalhes abaixo para registrar um novo rolo de papel.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="nome_rolo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Rolo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Rolo Fuji Brilhante" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="data_compra"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Compra</FormLabel>
                   <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="comprimento_inicial_metros"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comprimento (m)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="largura_cm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Largura (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Qualquer nota sobre o rolo..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Salvar Rolo</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
