<script setup lang="ts">
import { ref } from 'vue';
import { WcButton, WcInput, WcSelect, WcSwitch } from '@redvars/peacock-vue';

const OPTIONS = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Beta', value: 'beta' },
];

const clicks = ref(0);
const name = ref('Ada');
const enabled = ref(false);
const choice = ref('alpha');
</script>

<template>
  <main style="display: grid; gap: 16px; max-width: 360px; padding: 24px">
    <h1>Peacock + Vue</h1>
    <WcButton id="btn" @click="clicks++">Clicked {{ clicks }}</WcButton>
    <WcInput id="name" label="Name" v-model="name" />
    <WcButton id="reset" level="secondary" @click="name = 'reset'">Reset name</WcButton>
    <WcSwitch id="sw" label="Enabled" v-model="enabled" />
    <WcSelect id="sel" label="Choice" :options="OPTIONS" v-model="choice" />
    <output id="state">{{ JSON.stringify({ clicks, name, enabled, choice }) }}</output>
  </main>
</template>
