"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customersApi } from "@/lib/api/customers";
import type { EnderecoInput } from "@/types/api";
import { queryKeys } from "./queryKeys";

/** Cadastro de cliente do usuário logado (nome, telefone, loja preferida). */
export function useProfile() {
  return useQuery({ queryKey: queryKeys.perfil, queryFn: customersApi.myProfile });
}

export function useAddresses() {
  return useQuery({ queryKey: queryKeys.enderecos, queryFn: customersApi.addresses });
}

export function useAddAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EnderecoInput) => customersApi.createAddress(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.enderecos });
      void queryClient.invalidateQueries({ queryKey: queryKeys.perfil });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => customersApi.deleteAddress(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.enderecos });
      void queryClient.invalidateQueries({ queryKey: queryKeys.perfil });
    },
  });
}
