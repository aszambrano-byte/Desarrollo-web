<script setup lang="ts">
import { useCarrito } from "~/composables/useCarrito";
import type { Producto } from "~/types";

const { carrito, eliminar, vaciar, total } = useCarrito();
</script>

<template>
  <USlideover title="🛒 Carrito de compras">
    <div v-if="carrito.length">
      <div
        v-for="p in carrito"
        :key="p.id"
        class="flex justify-between items-center py-2 border-b"
      >
        <div class="flex gap-3 items-center">
          <img
            :src="p.imagen"
            alt="Imagen producto"
            class="w-12 h-12 object-contain"
          />
          <div>
            <h3 class="font-semibold">{{ p.nombre }}</h3>
            <p class="text-sm text-gray-500">{{ p.categoria }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="font-bold text-green-600">${{ p.precio }}</span>
          <UButton
            icon="i-lucide-trash"
            color="red"
            variant="soft"
            @click="eliminar(p.id)"
          />
        </div>
      </div>

      <div class="mt-4 flex justify-between font-semibold">
        <span>Total:</span>
        <span>${{ total.toFixed(2) }}</span>
      </div>

      <UButton color="neutral" class="mt-4 w-full" @click="vaciar">
        Vaciar carrito
      </UButton>
    </div>

    <p v-else class="text-center text-gray-500 mt-4">Tu carrito está vacío.</p>
  </USlideover>
</template>
