import { ref, computed } from "vue";
import type { Producto } from "~/types";

const carrito = ref<Producto[]>([]);
const mostrarCarrito = ref(false);

export function useCarrito() {
  function agregar(producto: Producto): void {
    const existe = carrito.value.find((p) => p.id === producto.id);
    if (!existe) carrito.value.push(producto);
    mostrarCarrito.value = true; // Abre el carrito automáticamente al agregar
  }

  function eliminar(id: number): void {
    carrito.value = carrito.value.filter((p) => p.id !== id);
  }

  function vaciar(): void {
    carrito.value = [];
  }

  const total = computed<number>(() =>
    carrito.value.reduce((acc, p) => acc + p.precio, 0),
  );

  return { carrito, mostrarCarrito, agregar, eliminar, vaciar, total };
}
