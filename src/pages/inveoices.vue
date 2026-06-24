<script setup lang="ts">
import productItem from './productItem.vue';

</script>

<template>
  <UDashboardPanel id="invoices">
    <template #header>
      <UDashboardNavbar title="Facturas" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton variant="outline" color="primary" size="sm">Agregar Factura</UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <productItem></productItem>
    </template>
  </UDashboardPanel>
</template>

<style scoped>
</style>