import { useState, useEffect, useCallback } from 'react'
import { billionaires, items, getCheckoutMessage, getCategoryMessage } from '../lib/data'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Select } from '../components/ui/select'
import { Input } from '../components/ui/input'
import { ScrollArea } from '../components/ui/scroll-area'
import { ShoppingCart, Moon, Sun, Twitter, Facebook, Linkedin, Copy, Share2 } from 'lucide-react'

export default function Home() {
  const [selectedBillionaire, setSelectedBillionaire] = useState(billionaires[0])
  const [remainingMoney, setRemainingMoney] = useState(selectedBillionaire.netWorth)
  const [purchases, setPurchases] = useState({})
  const [showReceipt, setShowReceipt] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = ['All', ...new Set(items.map(item => item.category))]

  useEffect(() => {
    setRemainingMoney(selectedBillionaire.netWorth)
    setPurchases({})
  }, [selectedBillionaire])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const formatMoney = (amount) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`
    }
    return `$${amount.toLocaleString()}`
  }

  const buyItem = (item, quantity = 1) => {
    const totalCost = item.price * quantity
    if (remainingMoney >= totalCost) {
      setPurchases(prev => ({
        ...prev,
        [item.id]: {
          ...item,
          quantity: (prev[item.id]?.quantity || 0) + quantity
        }
      }))
      setRemainingMoney(prev => prev - totalCost)
    }
  }

  const sellItem = (item, quantity = 1) => {
    if (purchases[item.id] && purchases[item.id].quantity >= quantity) {
      const totalRefund = item.price * quantity
      setPurchases(prev => {
        const newPurchases = { ...prev }
        newPurchases[item.id].quantity -= quantity
        if (newPurchases[item.id].quantity === 0) {
          delete newPurchases[item.id]
        }
        return newPurchases
      })
      setRemainingMoney(prev => prev + totalRefund)
    }
  }

  const getTotalSpent = () => {
    return selectedBillionaire.netWorth - remainingMoney
  }

  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(item => item.category === selectedCategory)

  // Sort filtered items by price (ascending)
  const sortedItems = [...filteredItems].sort((a, b) => a.price - b.price)

  const getPercentageSpent = () => {
    return ((getTotalSpent() / selectedBillionaire.netWorth) * 100).toFixed(2)
  }

  const getMostSpentCategory = () => {
    const categorySpending = {}
    
    Object.values(purchases).forEach(purchase => {
      const item = items.find(i => i.id === purchase.id)
      if (item) {
        const totalSpent = purchase.price * purchase.quantity
        categorySpending[item.category] = (categorySpending[item.category] || 0) + totalSpent
      }
    })
    
    let maxCategory = null
    let maxSpent = 0
    
    Object.entries(categorySpending).forEach(([category, spent]) => {
      if (spent > maxSpent) {
        maxSpent = spent
        maxCategory = category
      }
    })
    
    return maxCategory
  }

  const handleCheckout = () => {
    setShowReceipt(false)
    setShowCheckout(true)
  }

  const handleNewShopping = () => {
    setPurchases({})
    setRemainingMoney(selectedBillionaire.netWorth)
    setShowCheckout(false)
  }

  const getShareText = () => {
    const spent = formatMoney(getTotalSpent())
    const percentage = getPercentageSpent()
    return `I just spent ${spent} (${percentage}% of ${selectedBillionaire.name}'s net worth) on a virtual shopping spree! 💸`
  }

  const getCurrentUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href
    }
    return ''
  }

  const shareToTwitter = () => {
    const text = encodeURIComponent(getShareText())
    const url = encodeURIComponent(getCurrentUrl())
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`
    window.open(shareUrl, '_blank', 'width=600,height=400')
  }

  const shareToFacebook = () => {
    const url = encodeURIComponent(getCurrentUrl())
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
    window.open(shareUrl, '_blank', 'width=600,height=400')
  }

  const shareToLinkedIn = () => {
    const text = encodeURIComponent(getShareText())
    const url = encodeURIComponent(getCurrentUrl())
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`
    window.open(shareUrl, '_blank', 'width=600,height=400')
  }

  const copyToClipboard = async () => {
    try {
      const text = `${getShareText()}\n\nTry it yourself: ${getCurrentUrl()}`
      await navigator.clipboard.writeText(text)
      // You might want to show a toast notification here
      alert('Copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Dark mode toggle in top-right corner */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDarkMode(!darkMode)}
          className="rounded-full"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold">Spend</h1>
            <Select
              value={selectedBillionaire.id}
              onChange={(e) => {
                const billionaire = billionaires.find(b => b.id === e.target.value)
                setSelectedBillionaire(billionaire)
              }}
              className="w-48 order-3 sm:order-2"
            >
              {billionaires.map(billionaire => (
                <option key={billionaire.id} value={billionaire.id}>
                  {billionaire.emoji} {billionaire.name}
                </option>
              ))}
            </Select>
            <h1 className="text-3xl sm:text-4xl font-bold order-2 sm:order-3">Money</h1>
          </div>
          
          {/* Money Display */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6 mb-4">
            <p className="text-sm opacity-90">Remaining Balance</p>
            <p className="text-5xl font-bold">{formatMoney(remainingMoney)}</p>
            <p className="text-sm opacity-90 mt-2">
              {getPercentageSpent()}% spent of {formatMoney(selectedBillionaire.netWorth)}
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {sortedItems.map(item => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="text-center mb-4">
                  <div className="text-6xl mb-2">{item.emoji}</div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatMoney(item.price)}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => sellItem(item)}
                    disabled={!purchases[item.id]}
                  >
                    Sell
                  </Button>
                  
                  <Input
                    type="number"
                    value={purchases[item.id]?.quantity || 0}
                    onChange={(e) => {
                      const newQuantity = parseInt(e.target.value) || 0
                      const currentQuantity = purchases[item.id]?.quantity || 0
                      const diff = newQuantity - currentQuantity
                      
                      if (diff > 0) {
                        buyItem(item, diff)
                      } else if (diff < 0) {
                        sellItem(item, Math.abs(diff))
                      }
                    }}
                    className="text-center"
                    min="0"
                  />
                  
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => buyItem(item)}
                    disabled={remainingMoney < item.price}
                  >
                    Buy
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cart Button */}
        <div className="fixed bottom-8 right-8 z-40">
          <Button
            onClick={() => setShowReceipt(!showReceipt)}
            className="shadow-xl h-14 px-8 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600"
          >
            <ShoppingCart className="mr-2 h-6 w-6" />
            Cart ({Object.keys(purchases).length})
          </Button>
        </div>

        {/* Cart Modal */}
        {showReceipt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowReceipt(false)}>
            <div className="max-w-md w-full max-h-[80vh] overflow-hidden rounded-lg border bg-white dark:bg-zinc-900 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
                <ScrollArea className="h-[400px] mb-4">
                  {Object.values(purchases).length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Your cart is empty
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {Object.values(purchases).map(purchase => (
                        <div key={purchase.id} className="flex justify-between items-center p-2 rounded hover:bg-accent">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{purchase.emoji}</span>
                            <div>
                              <p className="font-medium">{purchase.name}</p>
                              <p className="text-sm text-muted-foreground">
                                x{purchase.quantity}
                              </p>
                            </div>
                          </div>
                          <p className="font-bold">
                            {formatMoney(purchase.price * purchase.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold">Total:</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatMoney(getTotalSpent())}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Remaining:</p>
                    <p className="font-medium">
                      {formatMoney(remainingMoney)}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  {Object.values(purchases).length > 0 && (
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={handleCheckout}
                    >
                      Proceed to Checkout
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowReceipt(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Checkout Modal */}
        {showCheckout && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowCheckout(false)}>
            <div className="max-w-md w-full rounded-lg border bg-white dark:bg-zinc-900 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 text-center">
                <h2 className="text-2xl font-bold mb-6">Checkout Complete!</h2>
                
                <div className="mb-6">
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {formatMoney(getTotalSpent())}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getPercentageSpent()}% of {selectedBillionaire.name}'s net worth
                  </p>
                </div>
                
                <div className="space-y-4 mb-6">
                  {getMostSpentCategory() && (
                    <div className="bg-accent rounded-lg p-4">
                      <p className="text-lg italic">
                        "{getCategoryMessage(getMostSpentCategory())}"
                      </p>
                    </div>
                  )}
                  <div className="bg-accent rounded-lg p-4">
                    <p className="text-lg italic">
                      "{getCheckoutMessage(parseFloat(getPercentageSpent()))}"
                    </p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-3 flex items-center justify-center gap-1">
                    <Share2 className="h-4 w-4" />
                    Share your results
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={shareToTwitter}
                      className="hover:bg-blue-100 dark:hover:bg-blue-900"
                    >
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={shareToFacebook}
                      className="hover:bg-blue-600/10 dark:hover:bg-blue-600/20"
                    >
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={shareToLinkedIn}
                      className="hover:bg-blue-700/10 dark:hover:bg-blue-700/20"
                    >
                      <Linkedin className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyToClipboard}
                      className="hover:bg-accent"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={handleNewShopping}
                  >
                    Start New Shopping Spree
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowCheckout(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
