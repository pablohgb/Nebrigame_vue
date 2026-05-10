<template>
  
  <div class="rango-wrapper">
    <div class="rango-labels">
      <span>{{ modelMin }}€</span>
      <span>{{ modelMax }}€</span>
    </div>
    <div class="track" ref="trackRef" @mousedown="onTrackClick">
      <div class="track-fill" :style="estiloFill" />
      <div
        class="thumb"
        :style="{ left: pctMin + '%' }"
        @mousedown.stop="startDrag('min', $event)"
      />
      <div
        class="thumb"
        :style="{ left: pctMax + '%' }"
        @mousedown.stop="startDrag('max', $event)"
      />
    </div>
  </div>

</template>


<script setup>

  import { ref, computed } from 'vue'

  const props = defineProps({
    min:      { type: Number, default: 0 },
    max:      { type: Number, default: 100 },
    modelMin: { type: Number, default: 0 },
    modelMax: { type: Number, default: 100 }
  })

  const emit = defineEmits(['update:modelMin', 'update:modelMax'])

  const trackRef = ref(null)
  const GAP_PCT = 5

  const pctMin = computed(() => ((props.modelMin - props.min) / (props.max - props.min)) * 100)
  const pctMax = computed(() => ((props.modelMax - props.min) / (props.max - props.min)) * 100)

  const estiloFill = computed(() => ({
    left:  pctMin.value + '%',
    width: (pctMax.value - pctMin.value) + '%'
  }))

  const pctToValor = (pct) => {
    return Math.round(props.min + (pct / 100) * (props.max - props.min))
  }

  const getPct = (clientX) => {
    const rect = trackRef.value.getBoundingClientRect()
    return Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
  }

  const startDrag = (thumb, e) => {
    e.preventDefault()
    const onMove = (moveEvent) => {
      const pct = getPct(moveEvent.clientX)
      const valor = pctToValor(pct)
      const gapValor = Math.ceil((props.max - props.min) * GAP_PCT / 100)
      if (thumb === 'min') {
        emit('update:modelMin', Math.min(valor, props.modelMax - gapValor))
      } else {
        emit('update:modelMax', Math.max(valor, props.modelMin + gapValor))
      }
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

</script>


<style scoped>

  .rango-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .rango-labels {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: #000000;
  }

  .track {
    position: relative;
    height: 4px;
    background: #ddd;
    border-radius: 4px;
    margin: 10px 0;
    cursor: pointer;
  }

  .track-fill {
    position: absolute;
    height: 100%;
    background: #7439b3;
    border-radius: 4px;
  }

  .thumb {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #7439b3;
    border: 2px solid white;
    box-shadow: 0 0 0 1px #7439b3;
    cursor: grab;
    transition: box-shadow 0.15s;
  }

  .thumb:hover {
    box-shadow: 0 0 0 4px rgba(116, 57, 179, 0.2);
  }

  .thumb:active {
    cursor: grabbing;
    box-shadow: 0 0 0 6px rgba(116, 57, 179, 0.2);
  }

</style>