<script setup lang="ts">
import { computed, ref } from "vue";
import { useColorMode } from "@vueuse/core";
import type { DropdownMenuItem } from "@nuxt/ui";

defineProps<{
  collapsed?: boolean;
}>();

const colorMode = useColorMode();

const user = ref({
  name: "Antonio",
  email: "docente@example.com",
  avatar: {
    alt: "Antonio",
  },
});

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      type: "label",
      label: user.value.name,
      avatar: user.value.avatar,
    },
  ],
  [
    {
      label: "Apariencia",
      icon: "i-lucide-sun-moon",
      children: [
        {
          label: "Claro",
          icon: "i-lucide-sun",
          type: "checkbox",
          checked: colorMode.value === "light",
          onSelect(e: Event) {
            e.preventDefault();
            colorMode.value = "light";
          },
        },
        {
          label: "Oscuro",
          icon: "i-lucide-moon",
          type: "checkbox",
          checked: colorMode.value === "dark",
          onSelect(e: Event) {
            e.preventDefault();
            colorMode.value = "dark";
          },
        },
        {
          label: "Sistema",
          icon: "i-lucide-monitor",
          type: "checkbox",
          checked: colorMode.value === "auto",
          onSelect(e: Event) {
            e.preventDefault();
            colorMode.value = "auto";
          },
        },
      ],
    },
  ],
]);
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{
      content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)',
    }"
  >
    <UButton
      v-bind="{
        ...user,
        label: collapsed ? undefined : user.name,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down',
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed',
      }"
    />
  </UDropdownMenu>
</template>
