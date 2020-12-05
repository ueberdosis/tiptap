<template>
  <node-view-wrapper class="draw">
    <button @click="clear">
      clear
    </button>
    <svg viewBox="0 0 500 250" ref="canvas">
      <template v-for="line in node.attrs.lines">
        <path
          v-if="line.id !== currentId"
          :key="line.id"
          :d="line.d"
          :id="`id-${line.id}`"
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
      currentId: uuid(),
    }
  },

  methods: {
    clear() {
      this.updateAttributes({
        lines: [],
      })
    },
  },

  mounted() {
    let ptdata = []
    let path
    let drawing = false

    const line = d3.line()
      .x(d => d.x)
      .y(d => d.y)

    const svg = d3.select(this.$refs.canvas)

    const listen = event => {
      drawing = true
      ptdata = [] // reset point data

      path = svg.append('path') // start a new line
        .data([ptdata])
        .attr('id', `id-${this.currentId}`)
        .attr('d', line)

      if (event.type === 'mousedown') {
        svg.on('mousemove', onmove)
      } else {
        svg.on('touchmove', onmove)
      }
    }

    const ignore = event => {
      svg.on('mousemove', null)
      svg.on('touchmove', null)

      if (!drawing) {
        return
      }

      drawing = false

      d3.select(this.$refs.canvas).select(`#id-${this.currentId}`).remove()
      this.currentId = uuid()
    }

    svg
      .on('mousedown', listen)
      .on('mouseup', ignore)
      .on('mouseleave', ignore)
      .on('touchstart', listen)
      .on('touchend', ignore)
      .on('touchleave', ignore)

    function onmove(event) {
      event.preventDefault()

      const point = d3.pointers(event)[0]

      ptdata.push({ x: point[0], y: point[1] })
      tick()
    }

    const tick = () => {
      path.attr('d', points => {
        const d = line(points)
        const lines = this.node.attrs.lines.filter(item => item.id !== this.currentId)

        this.updateAttributes({
          lines: [
            ...lines,
            {
              id: this.currentId,
              d,
            },
          ],
        })

        return d
      })
    }
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
    stroke: #000;
    stroke-width: 2;
  }
}
</style>
