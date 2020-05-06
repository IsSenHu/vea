<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '350px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val)
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.setOptions(this.chartData)
    },
    setOptions(chartData) {
      this.chart.setOption({
        xAxis: {
          data: chartData.x,
          boundaryGap: false,
          axisTick: {
            show: false
          }
        },
        grid: {
          left: 10,
          right: 10,
          bottom: 20,
          top: 30,
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          padding: [5, 10]
        },
        yAxis: {
          axisTick: {
            show: false
          }
        },
        legend: {
          data: ['身体得分', '体重(斤)', '水分(%)', '内脏脂肪', 'bmi', '体脂(%)', '肌肉(斤)', '蛋白质(%)', '基础代谢(千卡)', '骨量(斤)', '身体年龄(岁)']
        },
        series: [{
          name: '身体得分',
          smooth: true,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#3888fa',
              lineStyle: {
                color: '#3888fa',
                width: 2
              },
              areaStyle: {
                color: '#f3f8ff'
              }
            }
          },
          data: chartData.bodyScore,
          animationDuration: 2800,
          animationEasing: 'quadraticOut'
        },
        {
          name: '体重(斤)',
          smooth: true,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#DC143C',
              lineStyle: {
                color: '#DC143C',
                width: 2
              },
              areaStyle: {
                color: '#f3f8ff'
              }
            }
          },
          data: chartData.weight,
          animationDuration: 2800,
          animationEasing: 'quadraticOut'
        },
        {
          name: '水分(%)',
          smooth: true,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#FF1493',
              lineStyle: {
                color: '#FF1493',
                width: 2
              },
              areaStyle: {
                color: '#f3f8ff'
              }
            }
          },
          data: chartData.moisture,
          animationDuration: 2800,
          animationEasing: 'quadraticOut'
        },
        {
          name: '内脏脂肪',
          smooth: true,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#FF00FF',
              lineStyle: {
                color: '#FF00FF',
                width: 2
              },
              areaStyle: {
                color: '#f3f8ff'
              }
            }
          },
          data: chartData.visceralFat,
          animationDuration: 2800,
          animationEasing: 'quadraticOut'
        },
        {
          name: 'bmi',
          smooth: true,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#9400D3',
              lineStyle: {
                color: '#9400D3',
                width: 2
              },
              areaStyle: {
                color: '#f3f8ff'
              }
            }
          },
          data: chartData.bmi,
          animationDuration: 2800,
          animationEasing: 'quadraticOut'
        },
        {
          name: '体脂(%)',
          smooth: true,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#483D8B',
              lineStyle: {
                color: '#483D8B',
                width: 2
              },
              areaStyle: {
                color: '#f3f8ff'
              }
            }
          },
          data: chartData.bodyFat,
          animationDuration: 2800,
          animationEasing: 'quadraticOut'
        },
        {
          name: '肌肉(斤)',
          smooth: true,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#FF6347',
              lineStyle: {
                color: '#FF6347',
                width: 2
              },
              areaStyle: {
                color: '#f3f8ff'
              }
            }
          },
          data: chartData.muscle,
          animationDuration: 2800,
          animationEasing: 'quadraticOut'
        },
        {
          name: '蛋白质(%)',
          smooth: true,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#228B22',
              lineStyle: {
                color: '#228B22',
                width: 2
              },
              areaStyle: {
                color: '#f3f8ff'
              }
            }
          },
          data: chartData.protein,
          animationDuration: 2800,
          animationEasing: 'quadraticOut'
        },
        {
          name: '基础代谢(千卡)',
          smooth: true,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#FF4500',
              lineStyle: {
                color: '#FF4500',
                width: 2
              },
              areaStyle: {
                color: '#f3f8ff'
              }
            }
          },
          data: chartData.basalMetabolism,
          animationDuration: 2800,
          animationEasing: 'quadraticOut'
        },
        {
          name: '骨量(斤)',
          smooth: true,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#696969',
              lineStyle: {
                color: '#696969',
                width: 2
              },
              areaStyle: {
                color: '#f3f8ff'
              }
            }
          },
          data: chartData.boneMass,
          animationDuration: 2800,
          animationEasing: 'quadraticOut'
        },
        {
          name: '身体年龄(岁)',
          smooth: true,
          type: 'line',
          itemStyle: {
            normal: {
              color: '#00BFFF',
              lineStyle: {
                color: '#00BFFF',
                width: 2
              },
              areaStyle: {
                color: '#f3f8ff'
              }
            }
          },
          data: chartData.bodyAge,
          animationDuration: 2800,
          animationEasing: 'quadraticOut'
        }]
      })
    }
  }
}
</script>
