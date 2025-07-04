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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { PrintSize } from "@/lib/types"

const registerPrintSchema = z.object({
  nome_cliente: z.string().min(1, { message: "O nome do cliente é obrigatório." }),
  tipo_foto: z.enum(["20x30", "30x40", "30x60", "custom"], { required_error: "Selecione o tipo da foto."}),
  quantidade_fotos: z.coerce.number().int().positive({ message: "A quantidade deve ser maior que zero." }),
})

export function RegisterPrintDialog() {
  const [open, setOpen] = useState(false)
  const { registerPrint } = useFilmData()
  
  const form = useForm<z.infer<typeof registerPrintSchema>>({
    resolver: zodResolver(registerPrintSchema),
    defaultValues: {
        nome_cliente: "",
        tipo_foto: "20x30",
        quantidade_fotos: 1,
    }
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
        <Button>
          <Printer className="mr-2" />
          Registrar Impressão
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Registrar Nova Impressão</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da impressão. O sistema utilizará o rolo mais antigo disponível com papel suficiente.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
             <FormField
              control={form.control}
              name="nome_cliente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cliente</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João da Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

             <FormField
              control={form.control}
              name="tipo_foto"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tamanho da Foto</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="20x30" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          20cm x 30cm
                        </FormLabel>
                      </FormItem>
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
