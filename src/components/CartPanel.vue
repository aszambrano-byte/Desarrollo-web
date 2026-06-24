<script setup lang="ts">
import { useCarrito } from "~/composables/useCarrito";

// Extraemos mostrarCarrito para controlar la apertura/cierre desde el v-model
const { carrito, eliminarDelCarrito, vaciarCarrito, total, mostrarCarrito } = useCarrito();
</script>

<template>
  <USlideover v-model="mostrarCarrito">
    <div class="p-4 flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden">
      
      <div class="flex items-start justify-between pb-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <p class="text-sm text-gray-500 pr-4">
          Aquí puedes revisar los productos que has agregado a tu carrito.
        </p>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark-20-solid"
          class="-my-1"
          @click="mostrarCarrito = false"
        />
      </div>

      <div class="flex-1 overflow-y-auto mt-4 pr-1 space-y-4">
        <div v-if="carrito.length">
          <div
            v-for="p in carrito"
            :key="p.id"
            class="flex gap-4 p-4 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm bg-white dark:bg-gray-950 relative items-start"
          >
            <img
              :src="p.imagen"
              :alt="p.nombre"
              class="w-20 h-20 object-contain bg-white p-1 rounded-lg flex-shrink-0"
            />
            
            <div class="flex flex-col flex-1 min-w-0 pr-6">
              <h4 class="text-sm font-bold text-gray-800 dark:text-white line-clamp-2 leading-tight">
                {{ p.nombre }}
              </h4>
              <p class="text-xs text-gray-400 dark:text-gray-500 line-clamp-4 mt-1 leading-normal">
                {{ p.descripcion }}
              </p>
              <div class="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                ${{ p.precio }}
              </div>
            </div>

            <div class="absolute top-2 right-2">
              <UButton
                icon="i-lucide-trash"
                color="error"
                variant="ghost"
                size="xs"
                @click="eliminarDelCarrito(p.id)"
              />
            </div>
          </div>

          <div class="mt-6 flex justify-between font-semibold border-t pt-4 border-gray-200 dark:border-gray-800">
            <span>Total:</span>
            <span class="text-emerald-600">${{ total.toFixed(2) }}</span>
          </div>

          <UButton color="neutral" variant="solid" class="mt-4 w-full" @click="vaciarCarrito">
            Vaciar carrito
          </UButton>
        </div>

        <p v-else class="text-center text-gray-500 mt-8">
          Tu carrito está vacío.
        </p>
      </div>

    </div>
  </USlideover>
</template>
