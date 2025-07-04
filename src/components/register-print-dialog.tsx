"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Printer } from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { PrintSize } from "@/lib/types"

const registerPrintSchema = z.object({
  rolo_utilizado_id: z.string({ required_error: "Por favor, selecione um rolo." }),
  tipo_foto: z.enum(["30x40", "30x60", "custom"], { required_error: "Selecione o tipo da foto."}),
  quantidade_fotos: z.coerce.number().int().positive({ message: "A quantidade deve ser maior que zero." }),
})

export function RegisterPrintDialog() {
  const [open, setOpen] = useState(false)
  const { rolls, registerPrint } = useFilmData()
  const activeRolls = rolls.filter(r => r.ativo)

  const form = useForm<z.infer<typeof registerPrintSchema>>({
    resolver: zodResolver(registerPrintSchema),
  })

  function onSubmit(values: z.infer<typeof registerPrintSchema>) {
    registerPrint({
      ...values,
      tipo_foto: values.tipo_foto as PrintSize
    })
    form.reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Printer className="mr-2" />
          Registrar Impressão
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Registrar Nova Impressão</DialogTitle>
          <DialogDescription>
            Selecione o rolo utilizado e os detalhes das fotos para registrar o consumo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
            <FormField
              control={form.control}
              name="rolo_utilizado_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rolo Utilizado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um rolo ativo..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activeRolls.map(roll => (
                        <SelectItem key={roll.id} value={roll.id}>
                          {roll.nome_rolo} ({roll.comprimento_atual_metros.toFixed(2)}m restantes)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="tipo_foto"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo/Tamanho da Foto</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="30x40" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          30cm x 40cm
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="30x60" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          30cm x 60cm
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="custom" disabled />
                        </FormControl>
                        <FormLabel className="font-normal text-muted-foreground">
                          Outro (em breve)
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantidade_fotos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade de Fotos</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ex: 25" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Registrar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
