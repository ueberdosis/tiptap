<template>
  <node-view-wrapper class="draw">
    <div class="control-group">
      <div class="button-group">
        <input type="color" v-model="color" />
        <input type="number" min="1" max="10" v-model="size" />
        <button @click="clear">Clear</button>
      </div>
      <svg viewBox="0 0 500 250" ref="canvas">
        <template v-for="item in node.attrs.lines">
          <path
            v-if="item.id !== id"
            :key="item.id"
            :d="item.path"
            :id="`id-${item.id}`"
            :stroke="item.color"
            :stroke-width="item.size"
          />
        </template>
      </svg>
    </div>
  </node-view-wrapper>
</template>

<script>
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'
import * as d3 from 'd3'
import { v4 as uuid } from 'uuid'

const getRandomElement = list => {
  return list[Math.floor(Math.random() * list.length)]
}

export default {
  name: 'Paper',

  components: {
    NodeViewWrapper,
  },

  props: nodeViewProps,

  data() {
    return {
      color: getRandomElement(['#A975FF', '#FB5151', '#FD9170', '#FFCB6B', '#68CEF8', '#80CBC4', '#9DEF8F']),
      size: Math.ceil(Math.random() * Math.floor(10)),
      svg: null,
      path: null,
      points: [],
      drawing: false,
      id: uuid(),
    }
  },

  methods: {
    onStartDrawing(event) {
      this.drawing = true
      this.points = []
      this.path = this.svg
        .append('path')
        .data([this.points])
        .attr('id', `id-${this.id}`)
        .attr('stroke', this.color)
        .attr('stroke-width', this.size)

      const moveEvent = event.type === 'mousedown' ? 'mousemove' : 'touchmove'

      this.svg.on(moveEvent, this.onMove)
    },

    onMove(event) {
      event.preventDefault()
      this.points.push(d3.pointers(event)[0])
      this.tick()
    },

    onEndDrawing() {
      this.svg.on('mousemove', null)
      this.svg.on('touchmove', null)

      if (!this.drawing) {
        return
      }

      this.drawing = false
      this.svg.select(`#id-${this.id}`).remove()
      this.id = uuid()
    },

    tick() {
      requestAnimationFrame(() => {
        this.path.attr('d', points => {
          const path = d3.line().curve(d3.curveBasis)(points)
          const lines = this.node.attrs.lines.filter(item => item.id !== this.id)

          this.updateAttributes({
            lines: [
              ...lines,
              {
                id: this.id,
                color: this.color,
                size: this.size,
                path,
              },
            ],
          })

          return path
        })
      })
    },

    clear() {
      this.updateAttributes({
        lines: [],
      })
    },
  },

  mounted() {
    this.svg = d3.select(this.$refs.canvas)

    this.svg
      .on('mousedown', this.onStartDrawing)
      .on('mouseup', this.onEndDrawing)
      .on('mouseleave', this.onEndDrawing)
      .on('touchstart', this.onStartDrawing)
      .on('touchend', this.onEndDrawing)
      .on('touchleave', this.onEndDrawing)
  },
}
</script>

<style lang="scss">
.draw {
  svg {
    background: #f1f3f5;
    cursor: crosshair;
  }

  path {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
}
</style>
