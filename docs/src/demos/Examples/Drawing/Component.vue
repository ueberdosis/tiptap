<template>
  <node-view-wrapper class="draw">
    <input type="color" v-model="color">
    <input
      type="number"
      min="1"
      max="10"
      v-model="size"
    >
    <button @click="clear">
      clear
    </button>
    <svg viewBox="0 0 500 250" ref="canvas">
      <template v-for="item in node.attrs.lines">
        <path
          v-if="item.id !== currentId"
          :key="item.id"
          :d="item.d"
          :id="`id-${item.id}`"
          :stroke="item.color"
          :stroke-width="item.size"
        />
      </template>
    </svg>
  </node-view-wrapper>
</template>

<script>
import { v4 as uuid } from 'uuid'
import * as d3 from 'd3'

export default {
  props: {
    updateAttributes: {
      type: Function,
      required: true,
    },

    node: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      color: '#000000',
      size: 2,
      currentId: uuid(),
      ptdata: [],
      path: null,
      drawing: false,
      svg: null,
      line: d3.line()
        .x(d => d.x)
        .y(d => d.y),
    }
  },

  methods: {
    clear() {
      this.updateAttributes({
        lines: [],
      })
    },

    tick() {
      this.path.attr('d', points => {
        const d = this.line(points)
        const lines = this.node.attrs.lines.filter(item => item.id !== this.currentId)

        this.updateAttributes({
          lines: [
            ...lines,
            {
              id: this.currentId,
              color: this.color,
              size: this.size,
              d,
            },
          ],
        })

        return d
      })
    },

    listen(event) {
      this.drawing = true
      this.ptdata = []

      this.path = this.svg
        .append('path')
        .data([this.ptdata])
        .attr('id', `id-${this.currentId}`)
        .attr('d', this.line)
        .attr('stroke', this.color)
        .attr('stroke-width', this.size)

      const moveEvent = event.type === 'mousedown'
        ? 'mousemove'
        : 'touchmove'

      this.svg.on(moveEvent, this.onmove)
    },

    ignore() {
      this.svg.on('mousemove', null)
      this.svg.on('touchmove', null)

      if (!this.drawing) {
        return
      }

      this.drawing = false

      d3.select(this.$refs.canvas)
        .select(`#id-${this.currentId}`)
        .remove()

      this.currentId = uuid()
    },

    onmove(event) {
      event.preventDefault()

      const point = d3.pointers(event)[0]

      this.ptdata.push({ x: point[0], y: point[1] })
      this.tick()
    },
  },

  mounted() {
    this.svg = d3.select(this.$refs.canvas)

    this.svg
      .on('mousedown', this.listen)
      .on('mouseup', this.ignore)
      .on('mouseleave', this.ignore)
      .on('touchstart', this.listen)
      .on('touchend', this.ignore)
      .on('touchleave', this.ignore)
  },
}
</script>

<style lang="scss">
.draw {
  svg {
    background: #EEE;
    cursor: crosshair;
  }

  path {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
}
</style>
