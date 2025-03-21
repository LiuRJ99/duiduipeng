import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Card {
  color: number
  id: number
}

export const useGameStore = defineStore('game', () => {
  // 状态
  const deck = ref<Card[]>([])
  const hand = ref<(Card | null)[]>([])  // 改为可能包含null的固定长度数组
  const discardPile = ref<Card[]>([])
  const gameOver = ref(false)
  // 新增游戏统计状态
  const matchCount = ref(0)
  const roundCount = ref(0)
  const lastMatchResult = ref<string>('')

  // 初始化牌组
  const initializeDeck = () => {
    const newDeck: Card[] = []
    // 9种颜色，每种7张
    for (let color = 1; color <= 9; color++) {
      for (let i = 0; i < 7; i++) {
        newDeck.push({ color, id: color * 100 + i })
      }
    }
    // 洗牌
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]]
    }
    deck.value = newDeck
  }

  // 发牌
  const dealInitialCards = () => {
    // 初始化9个位置的数组
    hand.value = new Array(9).fill(null)
    // 按顺序填充9个位置
    for (let i = 0; i < 9; i++) {
      hand.value[i] = deck.value.shift()!
    }
  }

  // 检查是否有可以碰的牌（从前往后检查）
  const findMatch = (isCheckingOnly: boolean = false) => {
    if (!isCheckingOnly) {
      roundCount.value++ // 只在实际游戏检查时增加回合数
    }
    // 遍历所有位置
    for (let i = 0; i < hand.value.length - 1; i++) {
      const currentCard = hand.value[i]
      if (!currentCard) continue

      // 从当前位置往后检查是否有相同颜色的牌
      for (let j = i + 1; j < hand.value.length; j++) {
        const nextCard = hand.value[j]
        if (nextCard && nextCard.color === currentCard.color) {
          return currentCard.color
        }
      }
    }
    return null
  }

  // 执行碰牌操作
  const makeMatch = async (color: number) => {
    const matchedCards: Card[] = []
    const positions: number[] = []
    
    // 从前往后找两张相同颜色的牌
    for (let i = 0; i < hand.value.length && positions.length < 2; i++) {
      if (hand.value[i]?.color === color) {
        const card = hand.value[i]!
        positions.push(i)
        matchedCards.push(card)
      }
    }

    // 等待动画完成
    await new Promise(resolve => setTimeout(resolve, 500))

    // 移除匹配的牌
    positions.forEach(pos => {
      hand.value[pos] = null
    })

    // 加入弃牌堆
    discardPile.value.push(...matchedCards)
    matchCount.value++ // 成功配对时增加配对计数
    
    // 显示配对成功提示，包含总配对数
    lastMatchResult.value = `已找到 ${matchCount.value} 对`

    // 等待一小段时间后添加新牌
    await new Promise(resolve => setTimeout(resolve, 300))

    // 从牌堆抽新牌填充第一个空位
    let newCardPosition: number | null = null
    if (deck.value.length > 0) {
      // 找到第一个空位
      const firstEmptyIndex = hand.value.findIndex(card => card === null)
      if (firstEmptyIndex !== -1) {
        const newCard = deck.value.pop()!
        hand.value[firstEmptyIndex] = newCard
        newCardPosition = firstEmptyIndex

        // 补完新牌后再检查游戏是否需要结束
        const hasValidCards = hand.value.some(card => card !== null)
        if (hasValidCards && findMatch(true) === null) {
          checkGameOver()
        }
      }
    }

    return newCardPosition
  }

  // 检查游戏是否结束
  const checkGameOver = () => {
    if (findMatch(true) === null) {
      gameOver.value = true
      lastMatchResult.value = `游戏结束！共找到 ${matchCount.value} 对`
      return true
    }
    lastMatchResult.value = '没有可配对的牌'
    return false
  }

  // 重置游戏
  const resetGame = () => {
    deck.value = []
    hand.value = new Array(9).fill(null)
    discardPile.value = []
    gameOver.value = false
    matchCount.value = 0
    roundCount.value = 0
    lastMatchResult.value = ''
    initializeDeck()
    dealInitialCards()
  }

  // 计算属性
  const remainingCards = computed(() => deck.value.length)

  return {
    deck,
    hand,
    discardPile,
    gameOver,
    remainingCards,
    matchCount,
    roundCount,
    lastMatchResult,
    initializeDeck,
    dealInitialCards,
    findMatch,
    makeMatch,
    checkGameOver,
    resetGame
  }
})
