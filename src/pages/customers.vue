<script setup lang="ts">
import { computed, h, reactive, ref, resolveComponent, useTemplateRef, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import { getPaginationRowModel, type Row } from '@tanstack/table-core'
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui'
import * as z from 'zod'

type ClienteEstado = 'activo' | 'inactivo' | 'pendiente'

interface Cliente {
  id: number
  nombre: string
  email: string
  telefono: string
  ciudad: string
  estado: ClienteEstado
  fechaRegistro: string
}

const UAvatar = resolveComponent('UAvatar')
const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')

const estadoItems: Array<{ label: string, value: ClienteEstado }> = [
  { label: 'Activo', value: 'activo' },
  { label: 'Inactivo', value: 'inactivo' },
  { label: 'Pendiente', value: 'pendiente' }
]
const estadoFiltroItems: Array<{ label: string, value: ClienteEstado | 'todos' }> = [
  { label: 'Todos', value: 'todos' },
  ...estadoItems
]
const estadoColors: Record<ClienteEstado, 'success' | 'neutral' | 'warning'> = {
  activo: 'success',
  inactivo: 'neutral',
  pendiente: 'warning'
}

const clientesIniciales: Cliente[] = [
  {
    id: 1001,
    nombre: 'Maria Gonzalez',
    email: 'maria.gonzalez@example.com',
    telefono: '+51 987 654 321',
    ciudad: 'Lima',
    estado: 'activo',
    fechaRegistro: '2026-05-12'
  },
  {
    id: 1002,
    nombre: 'Carlos Ramirez',
    email: 'carlos.ramirez@example.com',
    telefono: '+51 912 345 678',
    ciudad: 'Arequipa',
    estado: 'pendiente',
    fechaRegistro: '2026-05-15'
  },
  {
    id: 1003,
    nombre: 'Lucia Torres',
    email: 'lucia.torres@example.com',
    telefono: '+51 998 112 233',
    ciudad: 'Cusco',
    estado: 'activo',
    fechaRegistro: '2026-05-18'
  },
  {
    id: 1004,
    nombre: 'Jorge Salazar',
    email: 'jorge.salazar@example.com',
    telefono: '+51 944 556 677',
    ciudad: 'Trujillo',
    estado: 'inactivo',
    fechaRegistro: '2026-05-20'
  },
  {
    id: 1005,
    nombre: 'Ana Vargas',
    email: 'ana.vargas@example.com',
    telefono: '+51 955 223 344',
    ciudad: 'Piura',
    estado: 'activo',
    fechaRegistro: '2026-05-23'
  }
]

const schema = z.object({
  nombre: z.string().min(2, 'Ingresa al menos 2 caracteres'),
  email: z.string().email('Ingresa un correo valido'),
  telefono: z.string().min(7, 'Ingresa un telefono valido'),
  ciudad: z.string().min(2, 'Ingresa la ciudad'),
  estado: z.enum(['activo', 'inactivo', 'pendiente'])
})

type Schema = z.output<typeof schema>

const toast = useToast()
const table = useTemplateRef('table')
const clientes = useStorage<Cliente[]>('clientes-crud-v1', clientesIniciales)

const search = ref('')
const estadoFiltro = ref<ClienteEstado | 'todos'>('todos')
const columnVisibility = ref()
const rowSelection = ref({})
const pagination = ref({
  pageIndex: 0,
  pageSize: 8
})

const formOpen = ref(false)
const editingId = ref<number | null>(null)
const state = reactive<Partial<Schema>>({
  nombre: '',
  email: '',
  telefono: '',
  ciudad: '',
  estado: 'activo'
})

const deleteOpen = ref(false)
const deleteIds = ref<number[]>([])

const clientesFiltrados = computed(() => {
  const term = search.value.trim().toLowerCase()

  return clientes.value.filter((cliente) => {
    const matchesSearch = !term || [
      cliente.nombre,
      cliente.email,
      cliente.telefono,
      cliente.ciudad
    ].some(value => value.toLowerCase().includes(term))
    const matchesEstado = estadoFiltro.value === 'todos' || cliente.estado === estadoFiltro.value

    return matchesSearch && matchesEstado
  })
})

const resumen = computed(() => [{
  label: 'Total clientes',
  value: clientes.value.length,
  icon: 'i-lucide-users',
  leadingClass: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25'
}, {
  label: 'Activos',
  value: clientes.value.filter(cliente => cliente.estado === 'activo').length,
  icon: 'i-lucide-user-check',
  leadingClass: 'p-2.5 rounded-full bg-success/10 ring ring-inset ring-success/25'
}, {
  label: 'Pendientes',
  value: clientes.value.filter(cliente => cliente.estado === 'pendiente').length,
  icon: 'i-lucide-clock-3',
  leadingClass: 'p-2.5 rounded-full bg-warning/10 ring ring-inset ring-warning/25'
}, {
  label: 'Inactivos',
  value: clientes.value.filter(cliente => cliente.estado === 'inactivo').length,
  icon: 'i-lucide-user-x',
  leadingClass: 'p-2.5 rounded-full bg-neutral/10 ring ring-inset ring-neutral/25'
}])

const modalTitle = computed(() => editingId.value === null ? 'Nuevo cliente' : 'Editar cliente')
const submitLabel = computed(() => editingId.value === null ? 'Crear cliente' : 'Guardar cambios')
const deleteCount = computed(() => deleteIds.value.length)
const deleteTitle = computed(() => deleteCount.value === 1 ? 'Eliminar cliente' : `Eliminar ${deleteCount.value} clientes`)
const deleteDescription = computed(() => {
  if (deleteCount.value === 1) {
    const cliente = clientes.value.find(item => item.id === deleteIds.value[0])

    return `Se eliminara ${cliente?.nombre || 'este cliente'} de la lista local.`
  }

  return 'Se eliminaran los clientes seleccionados de la lista local.'
})

watch([search, estadoFiltro], () => {
  pagination.value = { ...pagination.value, pageIndex: 0 }
  rowSelection.value = {}
})

function getEstadoLabel(estado: ClienteEstado): string {
  return estadoItems.find(item => item.value === estado)?.label || estado
}

function getColumnLabel(columnId: string): string {
  return {
    id: 'ID',
    nombre: 'Cliente',
    telefono: 'Telefono',
    ciudad: 'Ciudad',
    estado: 'Estado',
    fechaRegistro: 'Registro'
  }[columnId] || columnId
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(`${date}T00:00:00`))
}

function resetForm() {
  Object.assign(state, {
    nombre: '',
    email: '',
    telefono: '',
    ciudad: '',
    estado: 'activo' as ClienteEstado
  })
}

function openCreateModal() {
  editingId.value = null
  resetForm()
  formOpen.value = true
}

function openEditModal(cliente: Cliente) {
  editingId.value = cliente.id
  Object.assign(state, {
    nombre: cliente.nombre,
    email: cliente.email,
    telefono: cliente.telefono,
    ciudad: cliente.ciudad,
    estado: cliente.estado
  })
  formOpen.value = true
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const cliente = event.data
  const duplicatedEmail = clientes.value.some(item => item.email.toLowerCase() === cliente.email.toLowerCase() && item.id !== editingId.value)

  if (duplicatedEmail) {
    toast.add({ title: 'Correo duplicado', description: 'Ya existe un cliente con ese correo.', color: 'error' })
    return
  }

  if (editingId.value !== null) {
    clientes.value = clientes.value.map(item => item.id === editingId.value
      ? { ...item, ...cliente }
      : item)
    toast.add({ title: 'Cliente actualizado', description: `${cliente.nombre} fue actualizado.`, color: 'success' })
  } else {
    const nextId = Math.max(1000, ...clientes.value.map(item => item.id)) + 1

    clientes.value = [{
      id: nextId,
      ...cliente,
      fechaRegistro: new Date().toISOString().slice(0, 10)
    }, ...clientes.value]
    toast.add({ title: 'Cliente creado', description: `${cliente.nombre} fue agregado.`, color: 'success' })
  }

  formOpen.value = false
  resetForm()
}

function copyEmail(cliente: Cliente) {
  void navigator.clipboard?.writeText(cliente.email)
  toast.add({ title: 'Correo copiado', description: cliente.email })
}

function selectedClienteIds() {
  return table.value?.tableApi?.getFilteredSelectedRowModel().rows.map((row: Row<Cliente>) => row.original.id) ?? []
}

function openDeleteSelected() {
  const ids = selectedClienteIds()

  if (!ids.length) return

  deleteIds.value = ids
  deleteOpen.value = true
}

function openDeleteCliente(cliente: Cliente) {
  deleteIds.value = [cliente.id]
  deleteOpen.value = true
}

function deleteClientes() {
  const ids = new Set(deleteIds.value)
  const total = ids.size

  clientes.value = clientes.value.filter(cliente => !ids.has(cliente.id))
  deleteIds.value = []
  rowSelection.value = {}
  deleteOpen.value = false
  toast.add({
    title: total === 1 ? 'Cliente eliminado' : 'Clientes eliminados',
    description: total === 1 ? 'El registro fue eliminado.' : `${total} registros fueron eliminados.`,
    color: 'success'
  })
}

function getRowItems(row: Row<Cliente>) {
  return [
    {
      type: 'label' as const,
      label: row.original.nombre
    },
    {
      label: 'Editar',
      icon: 'i-lucide-pencil',
      onSelect() {
        openEditModal(row.original)
      }
    },
    {
      label: 'Copiar correo',
      icon: 'i-lucide-copy',
      onSelect() {
        copyEmail(row.original)
      }
    },
    {
      type: 'separator' as const
    },
    {
      label: 'Eliminar',
      icon: 'i-lucide-trash',
      color: 'error' as const,
      onSelect() {
        openDeleteCliente(row.original)
      }
    }
  ]
}

const columns: TableColumn<Cliente>[] = [
  {
    id: 'select',
    header: ({ table }) => h(UCheckbox, {
      'modelValue': table.getIsSomePageRowsSelected()
        ? 'indeterminate'
        : table.getIsAllPageRowsSelected(),
      'onUpdate:modelValue': (value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!value),
      'ariaLabel': 'Seleccionar todos'
    }),
    cell: ({ row }) => h(UCheckbox, {
      'modelValue': row.getIsSelected(),
      'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
      'ariaLabel': 'Seleccionar cliente'
    })
  },
  {
    accessorKey: 'id',
    header: 'ID'
  },
  {
    accessorKey: 'nombre',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Cliente',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    cell: ({ row }) => h('div', { class: 'flex items-center gap-3' }, [
      h(UAvatar, {
        alt: row.original.nombre,
        size: 'lg'
      }),
      h('div', undefined, [
        h('p', { class: 'font-medium text-highlighted' }, row.original.nombre),
        h('p', { class: 'text-sm text-muted' }, row.original.email)
      ])
    ])
  },
  {
    accessorKey: 'telefono',
    header: 'Telefono'
  },
  {
    accessorKey: 'ciudad',
    header: 'Ciudad'
  },
  {
    accessorKey: 'estado',
    header: 'Estado',
    cell: ({ row }) => h(UBadge, {
      variant: 'subtle',
      color: estadoColors[row.original.estado]
    }, () => getEstadoLabel(row.original.estado))
  },
  {
    accessorKey: 'fechaRegistro',
    header: 'Registro',
    cell: ({ row }) => formatDate(row.original.fechaRegistro)
  },
  {
    id: 'actions',
    cell: ({ row }) => h('div', { class: 'text-right' }, h(UDropdownMenu, {
      content: { align: 'end' },
      items: getRowItems(row)
    }, () => h(UButton, {
      icon: 'i-lucide-ellipsis-vertical',
      color: 'neutral',
      variant: 'ghost',
      class: 'ml-auto'
    })))
  }
]
</script>

<template>
  <UDashboardPanel id="clientes">
    <template #header>
      <UDashboardNavbar title="Clientes" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton label="Nuevo cliente" icon="i-lucide-plus" @click="openCreateModal" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UPageGrid class="lg:grid-cols-4 gap-4">
        <UPageCard
          v-for="item in resumen"
          :key="item.label"
          :icon="item.icon"
          :title="item.label"
          variant="subtle"
          :ui="{
            leading: item.leadingClass,
            title: 'font-normal text-muted text-xs uppercase'
          }"
        >
          <span class="text-2xl font-semibold text-highlighted">{{ item.value }}</span>
        </UPageCard>
      </UPageGrid>

      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Buscar por nombre, correo, telefono o ciudad..."
          class="w-full lg:max-w-md"
        />

        <div class="flex flex-wrap items-center gap-1.5">
          <UButton
            v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length"
            color="error"
            variant="subtle"
            icon="i-lucide-trash"
            :label="`Eliminar (${table?.tableApi?.getFilteredSelectedRowModel().rows.length})`"
            @click="openDeleteSelected"
          />

          <USelect
            v-model="estadoFiltro"
            :items="estadoFiltroItems"
            :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
            class="min-w-36"
          />

          <UDropdownMenu
            :items="
              table?.tableApi
                ?.getAllColumns()
                .filter((column: any) => column.getCanHide())
                .map((column: any) => ({
                  label: getColumnLabel(column.id),
                  type: 'checkbox' as const,
                  checked: column.getIsVisible(),
                  onUpdateChecked(checked: boolean) {
                    table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
                  },
                  onSelect(e?: Event) {
                    e?.preventDefault()
                  }
                }))
            "
            :content="{ align: 'end' }"
          >
            <UButton
              label="Columnas"
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-settings-2"
            />
          </UDropdownMenu>
        </div>
      </div>

      <UTable
        ref="table"
        v-model:column-visibility="columnVisibility"
        v-model:row-selection="rowSelection"
        v-model:pagination="pagination"
        :pagination-options="{
          getPaginationRowModel: getPaginationRowModel()
        }"
        :data="clientesFiltrados"
        :columns="columns"
        class="shrink-0"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default',
          separator: 'h-0'
        }"
      />

      <UAlert
        v-if="!clientesFiltrados.length"
        color="neutral"
        variant="subtle"
        icon="i-lucide-search-x"
        title="No se encontraron clientes"
        description="Ajusta la busqueda o crea un nuevo cliente."
      />

      <div class="flex flex-col gap-3 border-t border-default pt-4 mt-auto sm:flex-row sm:items-center sm:justify-between">
        <div class="text-sm text-muted">
          {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} seleccionados de
          {{ clientesFiltrados.length }} cliente{{ clientesFiltrados.length === 1 ? '' : 's' }}.
        </div>

        <UPagination
          :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
          :items-per-page="table?.tableApi?.getState().pagination.pageSize"
          :total="clientesFiltrados.length"
          @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
        />
      </div>
    </template>
  </UDashboardPanel>

  <UModal v-model:open="formOpen" :title="modalTitle" description="Gestiona la informacion local del cliente.">
    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Nombre" name="nombre">
          <UInput v-model="state.nombre" class="w-full" placeholder="Maria Gonzalez" />
        </UFormField>

        <UFormField label="Correo" name="email">
          <UInput v-model="state.email" class="w-full" placeholder="cliente@example.com" />
        </UFormField>

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Telefono" name="telefono">
            <UInput v-model="state.telefono" class="w-full" placeholder="+51 987 654 321" />
          </UFormField>

          <UFormField label="Ciudad" name="ciudad">
            <UInput v-model="state.ciudad" class="w-full" placeholder="Lima" />
          </UFormField>
        </div>

        <UFormField label="Estado" name="estado">
          <USelect v-model="state.estado" :items="estadoItems" class="w-full" />
        </UFormField>

        <div class="flex justify-end gap-2 pt-2">
          <UButton
            label="Cancelar"
            color="neutral"
            variant="subtle"
            type="button"
            @click="formOpen = false"
          />
          <UButton
            :label="submitLabel"
            color="primary"
            variant="solid"
            type="submit"
          />
        </div>
      </UForm>
    </template>
  </UModal>

  <UModal v-model:open="deleteOpen" :title="deleteTitle" :description="deleteDescription">
    <template #body>
      <div class="flex justify-end gap-2">
        <UButton
          label="Cancelar"
          color="neutral"
          variant="subtle"
          @click="deleteOpen = false"
        />
        <UButton
          label="Eliminar"
          color="error"
          variant="solid"
          @click="deleteClientes"
        />
      </div>
    </template>
  </UModal>
</template>
