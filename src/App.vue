<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('App Launch')
})
</script>

<template>
  <router-view />
</template>

<style>
@import './styles/base.css';
</style>
