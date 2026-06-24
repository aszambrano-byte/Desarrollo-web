<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import type { Producto } from "@/types";

const productos = ref<Producto[]>([]);
const producto = ref<Producto>({
  id: 0,
  nombre: "",
  descripcion: "",
  precio: 0,
  stock: 0,
  categoria: "",
  imagen: "",
  marca: "",
  estado: "disponible",
});

const carrito = ref<Producto[]>([]);
const mostrarCarrito = ref(false);
const busqueda = ref("");
const editando = ref(false);

// 🔹 Cargar productos desde API
const getProducts = async () => {
  try {
    const response = await fetch("https://fakestoreapi.com/products");
    const data = await response.json();
    productos.value = data.map((p: any) => ({
      id: p.id,
      nombre: p.title,
      descripcion: p.description,
      precio: p.price,
      stock: 10,
      categoria: p.category,
      imagen: p.image,
      marca: "",
      estado: "disponible",
    }));
  } catch (error) {
    console.error("Error cargando productos:", error);
  }
};
onMounted(getProducts);

// 🔹 Persistencia manual
onMounted(() => {
  const guardados = localStorage.getItem("productosExtra");
  if (guardados) productos.value.push(...JSON.parse(guardados));
});
watch(
  productos,
  (nuevo) => {
    localStorage.setItem("productosExtra", JSON.stringify(nuevo));
  },
  { deep: true },
);

// 🔹 CRUD con validación
function guardarProducto() {
  if (
    !producto.value.nombre ||
    producto.value.precio <= 0 ||
    producto.value.stock <= 0
  ) {
    alert("Completa los campos correctamente.");
    return;
  }
  if (editando.value) {
    const index = productos.value.findIndex((p) => p.id === producto.value.id);
    productos.value[index] = { ...producto.value };
    editando.value = false;
  } else {
    producto.value.id = Date.now();
    productos.value.push({ ...producto.value });
  }
  limpiarFormulario();
}
function limpiarFormulario() {
  producto.value = {
    id: 0,
    nombre: "",
    descripcion: "",
    precio: 0,
    stock: 0,
    categoria: "",
    imagen: "",
    marca: "",
    estado: "disponible",
  };
}
function editarProducto(p: Producto) {
  producto.value = { ...p };
  editando.value = true;
}
function eliminarProducto(id: number) {
  productos.value = productos.value.filter((p) => p.id !== id);
}

// 🔹 Carrito
function agregarAlCarrito(p: Producto) {
  const existe = carrito.value.find((item) => item.id === p.id);
  if (!existe) carrito.value.push(p);
  mostrarCarrito.value = true;
}
function eliminarDelCarrito(id: number) {
  carrito.value = carriage.value.filter((p) => p.id !== id);
}
function vaciarCarrito() {
  carrito.value = [];
}
const total = computed(() =>
  carrito.value.reduce((acc, p) => acc + p.precio, 0),
);

// 🔹 Filtro
const productosFiltrados = computed(() =>
  productos.value.filter((p) =>
    [p.nombre, p.categoria, p.descripcion]
      .join(" ")
      .toLowerCase()
      .includes(busqueda.value.toLowerCase()),
  ),
);
</script>

<template>
  <div class="p-6 space-y-6 min-h-screen overflow-y-auto">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Registrar Producto</h2>
      <UButton
        variant="solid"
        color="primary"
        size="sm"
        @click="mostrarCarrito = !mostrarCarrito"
      >
        🛒 Ver Carrito ({{ carrito.length }})
      </UButton>
    </div>

    <UCard class="shadow-md">
      <UCardBody>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <UInput v-model="producto.nombre" placeholder="Nombre del producto" />
          <UInput
            v-model.number="producto.precio"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Precio (USD)"
          />
          <UInput
            v-model.number="producto.stock"
            type="number"
            min="1"
            placeholder="Cantidad en stock"
          />
          <UInput v-model="producto.categoria" placeholder="Categoría" />
          <UInput v-model="producto.imagen" placeholder="URL de imagen" />
          <UInput v-model="producto.marca" placeholder="Marca (opcional)" />
          <USelect
            v-model="producto.estado"
            :options="['disponible', 'agotado', 'inactivo']"
            placeholder="Estado"
          />
        </div>
        <UTextarea
          v-model="producto.descripcion"
          placeholder="Descripción del producto"
          class="mt-4"
        />
      </UCardBody>
      <UCardFooter class="flex gap-3 justify-end">
        <UButton color="success" variant="solid" @click="guardarProducto">{{
          editando ? "Actualizar" : "Guardar"
        }}</UButton>
        <UButton color="neutral" variant="solid" @click="limpiarFormulario"
          >Limpiar</UButton
        >
      </UCardFooter>
    </UCard>

    <UCard>
      <UCardHeader>
        <div class="flex justify-between items-center w-full">
          <UCardTitle>Listado de Productos</UCardTitle>
          <UInput v-model="busqueda" placeholder="Buscar..." class="w-1/3" />
        </div>
      </UCardHeader>
      <UCardBody>
        <div v-if="productosFiltrados.length" class="grid grid-cols-3 gap-4">
          <UCard v-for="p in productosFiltrados" :key="p.id">
            <img
              :src="p.imagen"
              :alt="p.nombre"
              class="h-40 mx-auto object-contain"
            />
            <UCardHeader>
              <UCardTitle>{{ p.nombre }}</UCardTitle>
              <UCardSubtitle>{{ p.categoria }}</UCardSubtitle>
            </UCardHeader>
            <UCardBody>
              <p>{{ p.descripcion }}</p>
              <p class="text-green-600 font-bold">${{ p.precio }}</p>
              <p class="text-xs">Stock: {{ p.stock }}</p>
              <p class="text-xs">Marca: {{ p.marca || "Sin marca" }}</p>
              <UBadge
                :color="
                  p.estado === 'disponible'
                    ? 'success'
                    : p.estado === 'agotado'
                      ? 'warning'
                      : 'error'
                "
                >{{ p.estado }}</UBadge
              >
            </UCardBody>
            <UCardFooter class="flex gap-2 justify-end">
              <UButton
                color="primary"
                variant="solid"
                @click="editarProducto(p)"
                >✏️ Editar</UButton
              >
              <UButton
                color="error"
                variant="solid"
                @click="eliminarProducto(p.id)"
                >🗑️ Eliminar</UButton
              >
              <UButton
                color="success"
                variant="solid"
                @click="agregarAlCarrito(p)"
                >➕ Agregar</UButton
              >
            </UCardFooter>
          </UCard>
        </div>
        <p v-else class="text-center text-gray-500 mt-4">
          No hay productos registrados.
        </p>
      </UCardBody>
    </UCard>

    <USlideover v-model:open="mostrarCarrito" title="🛒 Carrito de compras">
      <template #body>
        <div v-if="carrito.length" class="space-y-4">
          <div
            v-for="item in carrito"
            :key="item.id"
            class="flex gap-4 p-4 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm bg-white dark:bg-gray-950 relative items-start"
          >
            <img
              :src="item.imagen"
              :alt="item.nombre"
              class="w-20 h-20 object-contain bg-white p-1 rounded-lg flex-shrink-0"
            />
            <div class="flex flex-col flex-1 min-w-0 pr-6">
              <h4 class="text-sm font-bold text-gray-800 dark:text-white line-clamp-2 leading-tight">
                {{ item.nombre }}
              </h4>
              <p class="text-xs text-gray-400 dark:text-gray-500 line-clamp-3 mt-1 leading-normal">
                {{ item.descripcion }}
              </p>
              <div class="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                ${{ item.precio }}
              </div>
            </div>
            <div class="absolute top-2 right-2">
              <UButton
                icon="i-heroicons-trash"
                color="error"
                variant="ghost"
                size="xs"
                @click="eliminarDelCarrito(item.id)"
              />
            </div>
          </div>

          <div class="mt-6 flex justify-between font-semibold border-t pt-4 border-gray-200 dark:border-gray-800">
            <span>Total:</span>
            <span class="text-emerald-600">${{ total.toFixed(2) }}</span>
          </div>

          <UButton
            color="neutral"
            variant="solid"
            class="mt-4 w-full"
            @click="vaciarCarrito"
          >
            Vaciar carrito
          </UButton>
        </div>
        <p v-else class="text-center text-gray-500 mt-8">
          Tu carrito está vacío.
        </p>
      </template>
    </USlideover>
  </div>
</template>

<style scoped>
.grid {
  margin-top: 1rem;
}
</style>
