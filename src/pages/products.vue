<script setup lang="ts">
import { ref } from "vue";
import type { Product } from "@/types";

const productos = ref<Product[]>([]);
const carrito = ref<Product[]>([]);
const mostrarCarrito = ref(false);

const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch("https://fakestoreapi.com/products");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

productos.value = await getProducts();

function agregarAlCarrito(producto: Product) {
  carrito.value.push(producto);
  mostrarCarrito.value = true;
}
</script>

<template>
  <UDashboardPanel id="productos">
    <template #header>
      <UDashboardNavbar title="Productos" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            variant="outline"
            color="primary"
            size="sm"
            @click="mostrarCarrito = !mostrarCarrito"
          >
            Ver Carrito
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="grid grid-cols-3 gap-6">
        <UCard
          v-for="producto in productos"
          :key="producto.id"
          class="hover:shadow-lg transition"
        >
          <img
            :src="producto.image"
            :alt="producto.title"
            class="h-40 mx-auto object-contain"
          />
          <UCardHeader>
            <UCardTitle>{{ producto.title }}</UCardTitle>
            <UCardSubtitle>{{ producto.category }}</UCardSubtitle>
          </UCardHeader>
          <UCardBody>
            <p class="text-sm text-gray-600">{{ producto.description }}</p>
            <p class="text-lg font-bold text-green-600 mt-2">
              ${{ producto.price }}
            </p>
          </UCardBody>
          <UCardFooter>
            <UButton
              icon="i-heroicons-plus"
              color="primary"
              variant="soft"
              @click="agregarAlCarrito(producto)"
            >
              Agregar
            </UButton>
          </UCardFooter>
        </UCard>
      </div>

      <!-- Panel lateral del carrito -->
      <USlideover v-model="mostrarCarrito" title="Carrito de compras">
        <template #body>
          <p class="text-sm text-gray-500 mb-4">
            Aquí puedes revisar los productos que has agregado a tu carrito.
          </p>
          <div
            v-for="item in carrito"
            :key="item.id"
            class="mb-4 border-b pb-3"
          >
            <div class="flex gap-3">
              <img :src="item.image" class="w-16 h-16 object-contain" />
              <div>
                <h3 class="font-semibold">{{ item.title }}</h3>
                <p class="text-sm text-gray-600">{{ item.description }}</p>
                <p class="text-green-600 font-bold">${{ item.price }}</p>
              </div>
            </div>
          </div>
        </template>
      </USlideover>
    </template>
  </UDashboardPanel>
</template>

<style scoped>
.grid {
  margin-top: 1rem;
}
</style>
