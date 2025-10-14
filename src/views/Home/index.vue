<template>
  <div class="home">
    <div class="logo">NotePad</div>
    <div class="subtitle">简洁高效的笔记工具</div>
    <button type="button" class="enter-btn" @click="goNotebook">进入笔记</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
function goNotebook() {
  router.push('/notebook')
}

</script>

<style scoped>
.logo {
  font-size: 32px;
  font-weight: 600;
  color: #165DFF;
}

.subtitle {
  margin-top: 4px;
  font-size: 14px;
  color: #999;
}

.enter-btn {
  display: block;
  width: 120px;
  height: 40px;
  margin: 16px auto 0;
  background: #165DFF;
  color: #fff;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: transform 100ms ease, background 100ms ease;
}

.enter-btn:hover {
  background: #3b7aff;
  transform: scale(1.05);
}

.enter-btn:active {
  transform: scale(0.95);
}
</style>