<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
// 添加防抖函数
function debounce(fn: Function, delay: number) {
  let timer: number | null = null
  return function (this: any, ...args: any[]) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}
import { useGameStore } from '@/stores/game'

const store = useGameStore()
const matchedCards = ref<number[]>([])
const newCard = ref<number | null>(null)

// 跟踪匹配和新卡牌的位置
const trackCards = (positions: number[]) => {
  matchedCards.value = positions
  setTimeout(() => {
    matchedCards.value = []
  }, 500) // 动画持续时间
}

// 跟踪新卡牌
const trackNewCard = (position: number) => {
  newCard.value = position
  setTimeout(() => {
    newCard.value = null
  }, 500) // 动画持续时间
}

// 卡牌样式配置
const cardStyles = {
  cyberpunk: {
    1: { bg: '#FF1744', pattern: '赛博朋克', icon: '⚡' },
    2: { bg: '#00E676', pattern: '矩阵', icon: '⌘' },
    3: { bg: '#2979FF', pattern: '全息', icon: '◎' },
    4: { bg: '#FFD600', pattern: '电子', icon: '⚛' },
    5: { bg: '#D500F9', pattern: '量子', icon: '⭐' },
    6: { bg: '#00E5FF', pattern: '未来', icon: '⬡' },
    7: { bg: '#FF9100', pattern: '能量', icon: '⚔' },
    8: { bg: '#76FF03', pattern: '数据', icon: '☯' },
    9: { bg: '#14FFEC', pattern: '科技', icon: '⚝' }
  },
  fantasy: {
    1: { bg: '#8B0000', pattern: '火焰', icon: '🔥' },
    2: { bg: '#006400', pattern: '自然', icon: '🌿' },
    3: { bg: '#00008B', pattern: '水系', icon: '💧' },
    4: { bg: '#FFD700', pattern: '光明', icon: '✨' },
    5: { bg: '#4B0082', pattern: '暗影', icon: '🌙' },
    6: { bg: '#48D1CC', pattern: '风系', icon: '🌪️' },
    7: { bg: '#B8860B', pattern: '大地', icon: '🗻' },
    8: { bg: '#9400D3', pattern: '魔法', icon: '⭐' },
    9: { bg: '#CD853F', pattern: '神秘', icon: '🔮' }
  },
  emoji: {
    1: { bg: '#E91E63', pattern: '表情', icon: '😀' },
    2: { bg: '#4CAF50', pattern: '动物', icon: '🐱' },
    3: { bg: '#2196F3', pattern: '食物', icon: '🍎' },
    4: { bg: '#FFC107', pattern: '运动', icon: '⚽' },
    5: { bg: '#9C27B0', pattern: '爱心', icon: '❤️' },
    6: { bg: '#00BCD4', pattern: '音乐', icon: '🎵' },
    7: { bg: '#FF5722', pattern: '天气', icon: '☀️' },
    8: { bg: '#8BC34A', pattern: '植物', icon: '🌺' },
    9: { bg: '#03A9F4', pattern: '星星', icon: '⭐' }
  }
}

const currentStyle = ref('cyberpunk')
const colorMap = computed(() => cardStyles[currentStyle.value])

// 自动检查配对
const autoCheck = async () => {
  try {
    if (store.gameOver) {
      return;
    }

    const matchColor = store.findMatch()
    if (matchColor !== null) {
      const positions: number[] = []
      store.hand.forEach((card, index) => {
        if (card?.color === matchColor && positions.length < 2) {
          positions.push(index)
        }
      })
      
      trackCards(positions)
      
      const newCardPosition = await store.makeMatch(matchColor)
      if (newCardPosition !== null) {
        trackNewCard(newCardPosition)
      }
      
      // 使用防抖函数包装自动检查
      const debouncedAutoCheck = debounce(() => {
        if (!store.gameOver) {
          autoCheck()
        }
      }, 1000)
      
      debouncedAutoCheck()
    } else {
      store.checkGameOver()
    }
  } catch (error) {
    console.error('自动检查过程中出错:', error)
    store.checkGameOver()
  }
}

// 开始新游戏
const isGameStarted = ref(false)

const startNewGame = () => {
  try {
    store.resetGame()
    matchedCards.value = []
    newCard.value = null
    isGameStarted.value = true
    setTimeout(autoCheck, 1000)
  } catch (error) {
    console.error('开始新游戏时出错:', error)
  }
}

// 是否已选择风格
const hasSelectedStyle = ref(false)

// 选择卡牌风格
const selectStyle = (style: string) => {
  try {
    currentStyle.value = style
    hasSelectedStyle.value = true
    store.resetGame() // 确保在选择风格后重置游戏状态
    isGameStarted.value = false // 重置游戏状态
  } catch (error) {
    console.error('选择风格时出错:', error)
  }
}

// 切换卡牌风格
const changeStyle = () => {
  const styles = Object.keys(cardStyles)
  const currentIndex = styles.indexOf(currentStyle.value)
  currentStyle.value = styles[(currentIndex + 1) % styles.length]
}

// 初始化游戏
onMounted(() => {
  hasSelectedStyle.value = false // 确保游戏开始前需要选择风格
  store.resetGame() // 仅重置游戏状态，不开始自动检测
})

// 计算剩余牌数
const remainingCards = computed(() => store.remainingCards)
</script>

<template>
  <div class="game-container">
    <h1>对对碰</h1>
    
    <div class="game-status">
      <div class="stats">
        <p>剩余牌数: {{ remainingCards }}</p>
        <p>当前回合: {{ store.roundCount }}</p>
        <p>成功配对: {{ store.matchCount }}</p>
      </div>
      <div class="match-result" v-if="store.lastMatchResult">
        {{ store.lastMatchResult }}
      </div>
      <div v-if="!hasSelectedStyle" class="style-selection">
        <h2>选择卡牌风格</h2>
        <div class="style-buttons">
          <button @click="selectStyle('cyberpunk')" class="style-button cyberpunk">赛博朋克</button>
          <button @click="selectStyle('fantasy')" class="style-button fantasy">奇幻风格</button>
          <button @click="selectStyle('emoji')" class="style-button emoji">表情符号</button>
        </div>
      </div>
      <div v-else class="buttons">
        <button @click="startNewGame" :disabled="isGameStarted">开始新游戏</button>
        <button @click="hasSelectedStyle = false" class="style-button" :disabled="isGameStarted">重选卡牌风格</button>
      </div>
    </div>

    <div class="hand">
      <div v-for="(card, index) in store.hand" :key="index" class="card-slot">
        <div v-if="card" 
             class="card" 
             :class="{
               'matched': matchedCards.includes(index),
               'new': newCard === index
             }"
             :style="{ 
               backgroundColor: colorMap[card.color].bg,
               backgroundImage: `radial-gradient(circle at 50% 50%, transparent 15%, rgba(255,255,255,0.1) 20%)`,
               boxShadow: `inset 0 0 20px rgba(255,255,255,0.2), 0 0 15px ${colorMap[card.color].bg}`
             }">
          <div class="card-content">
            <span class="card-icon">{{ colorMap[card.color].icon }}</span>
            <span class="card-pattern">{{ colorMap[card.color].pattern }}</span>
          </div>
        </div>
        <div v-else class="card empty"></div>
      </div>
    </div>

    <div class="discard-pile">
      <h3>已打出的牌 ({{ store.discardPile.length }})</h3>
      <div class="cards">
        <div v-for="card in store.discardPile" :key="card.id" 
             class="card small" 
             :style="{ 
               backgroundColor: colorMap[card.color].bg,
               backgroundImage: `radial-gradient(circle at 50% 50%, transparent 15%, rgba(255,255,255,0.1) 20%)`,
               boxShadow: `inset 0 0 10px rgba(255,255,255,0.2), 0 0 8px ${colorMap[card.color].bg}`
             }">
          <div class="card-content">
            <span class="card-icon small">{{ colorMap[card.color].icon }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="store.gameOver" class="game-over">
      游戏结束！
    </div>
  </div>
</template>

<style scoped>
.game-container {
  max-width: min(95vw, 800px);
  margin: 0 auto;
  padding: var(--base-spacing);
  text-align: center;
  background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
  min-height: 100vh;
  color: #fff;
  font-family: 'BlinkMacSystemFont', -apple-system, sans-serif;
}

h1 {
  color: #14FFEC;
  text-transform: uppercase;
  letter-spacing: min(0.6vw, 3px);
  text-shadow: 0 0 10px rgba(20, 255, 236, 0.5);
  margin-bottom: var(--base-spacing);
  font-size: min(6vw, 32px);
}

.game-status {
  margin: var(--base-spacing) 0;
  padding: calc(var(--base-spacing) * 0.75);
  background: rgba(0, 0, 0, 0.3);
  border-radius: min(2vw, 8px);
  border: 1px solid rgba(20, 255, 236, 0.2);
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: calc(var(--base-spacing) * 0.5);
  margin-bottom: calc(var(--base-spacing) * 0.5);
}

.stats p {
  color: #14FFEC;
  font-size: var(--base-font-size);
  margin: 0;
}

.match-result {
  color: #FF1744;
  font-size: calc(var(--base-font-size) * 1.2);
  font-weight: bold;
  text-shadow: 0 0 10px rgba(255, 23, 68, 0.5);
  margin: calc(var(--base-spacing) * 0.5) 0;
  animation: pulseText 1s ease-in-out;
}

@keyframes pulseText {
  0% { transform: scale(1); opacity: 0; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

.hand {
  display: grid;
  grid-template-columns: repeat(3, minmax(60px, 90px));
  grid-template-rows: repeat(3, minmax(90px, 135px));
  gap: var(--base-spacing);
  justify-content: center;
  margin: var(--base-spacing) auto;
  padding: calc(var(--base-spacing) * 1.5);
  background: rgba(0, 0, 0, 0.4);
  border-radius: min(3vw, 15px);
  border: 1px solid rgba(20, 255, 236, 0.2);
  box-shadow: 0 0 20px rgba(20, 255, 236, 0.1);
}

.card-slot {
  width: 100%;
  height: 100%;
  perspective: 1000px;
}

.card {
  width: 100%;
  height: 100%;
  border-radius: min(2vw, 10px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(16px, 4vw, 32px);
  color: white;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  transform-style: preserve-3d;
  border: 2px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.card-icon {
  font-size: 1.5em;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
}

.card-icon.small {
  font-size: 1em;
}

.card-pattern {
  font-size: 0.4em;
  letter-spacing: 1px;
  opacity: 0.8;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1));
  border-radius: inherit;
}

.card.empty {
  background: rgba(20, 255, 236, 0.05);
  border: 2px dashed rgba(20, 255, 236, 0.2);
  box-shadow: none;
}

.card:not(.empty):hover {
  transform: translateY(min(-2vw, -10px)) rotateX(10deg);
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.4);
}

.card.matched {
  animation: cardMatch 0.5s ease-out forwards;
}

.card.new {
  animation: cardNew 0.5s ease-out;
}

@keyframes cardMatch {
  0% { transform: scale(1); }
  50% { transform: scale(1.1) rotateY(180deg); }
  100% { transform: scale(0) rotateY(360deg); }
}

@keyframes cardNew {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

.discard-pile {
  margin-top: calc(var(--base-spacing) * 2);
  padding: var(--base-spacing);
  background: rgba(0, 0, 0, 0.3);
  border-radius: min(2vw, 10px);
  border: 1px solid rgba(20, 255, 236, 0.2);
}

.discard-pile h3 {
  color: #14FFEC;
  margin-bottom: var(--base-spacing);
  font-size: var(--base-font-size);
}

.discard-pile .cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: calc(var(--base-spacing) * 0.5);
  margin-top: calc(var(--base-spacing) * 0.5);
}

.card.small {
  width: min(45px, 10vw);
  height: min(67.5px, 15vw);
  font-size: clamp(12px, 2vw, 16px);
}

.game-over {
  margin-top: var(--base-spacing);
  font-size: min(8vw, 32px);
  color: #FF1744;
  font-weight: bold;
  text-shadow: 0 0 20px rgba(255, 23, 68, 0.5);
  animation: gameOverPulse 2s infinite;
}

.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--base-spacing) * 0.75);
  justify-content: center;
  margin-top: var(--base-spacing);
}

button {
  padding: calc(var(--base-spacing) * 0.6) calc(var(--base-spacing) * 1.25);
  font-size: var(--base-font-size);
  color: white;
  border: none;
  border-radius: min(1vw, 5px);
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  background: linear-gradient(45deg, #2979FF, #00E5FF);
  box-shadow: 0 0 15px rgba(41, 121, 255, 0.4);
  white-space: nowrap;
}

.style-selection {
  margin: var(--base-spacing) 0;
  text-align: center;
}

.style-selection h2 {
  color: #14FFEC;
  margin-bottom: var(--base-spacing);
  font-size: calc(var(--base-font-size) * 1.2);
}

.style-buttons {
  display: flex;
  gap: var(--base-spacing);
  justify-content: center;
  flex-wrap: wrap;
}

.style-button {
  min-width: 150px;
}

.style-button.cyberpunk {
  background: linear-gradient(45deg, #FF1744, #2979FF);
  box-shadow: 0 0 15px rgba(255, 23, 68, 0.4);
}

.style-button.fantasy {
  background: linear-gradient(45deg, #8B0000, #4B0082);
  box-shadow: 0 0 15px rgba(139, 0, 0, 0.4);
}

.style-button.emoji {
  background: linear-gradient(45deg, #E91E63, #FF5722);
  box-shadow: 0 0 15px rgba(233, 30, 99, 0.4);
}

@media (max-width: 480px) {
  .buttons {
    flex-direction: column;
    width: 100%;
  }

  button {
    width: 100%;
  }
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 25px rgba(41, 121, 255, 0.6);
}

button:disabled {
  background: linear-gradient(45deg, #666, #999);
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}

@keyframes gameOverPulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}
</style>
