import { useState, useEffect, useCallback } from 'react'
import { billionaires, items } from '../lib/data'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Select } from '../components/ui/select'
import { Input } from '../components/ui/input'
import { ScrollArea } from '../components/ui/scroll-area'
import { ShoppingCart, Moon, Sun } from 'lucide-react'

export default function Home() {
  const [selectedBillionaire, setSelectedBillionaire] = useState(billionaires[0])
  const [remainingMoney, setRemainingMoney] = useState(selectedBillionaire.netWorth)
  const [purchases, setPurchases] = useState({})
  const [showReceipt, setShowReceipt] = useState(false)
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-4">
            <h1 className="text-4xl font-bold">Spend</h1>
            <Select
              value={selectedBillionaire.id}
              onChange={(e) => {
                const billionaire = billionaires.find(b => b.id === e.target.value)
                setSelectedBillionaire(billionaire)
              }}
              className="w-48"
            >
              {billionaires.map(billionaire => (
                <option key={billionaire.id} value={billionaire.id}>
                  {billionaire.emoji} {billionaire.name}
                </option>
              ))}
            </Select>
            <h1 className="text-4xl font-bold">Money</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="ml-4"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
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

        {/* Receipt Button */}
        <div className="fixed bottom-8 right-8">
          <Button
            size="lg"
            onClick={() => setShowReceipt(!showReceipt)}
            className="shadow-lg"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Receipt ({Object.keys(purchases).length})
          </Button>
        </div>

        {/* Receipt Modal */}
        {showReceipt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full max-h-[80vh] overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Your Receipt</h2>
                <ScrollArea className="h-[400px] mb-4">
                  {Object.values(purchases).length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No purchases yet
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
                    <p className="font-semibold">Total Spent:</p>
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
                
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setShowReceipt(false)}
                >
                  Close
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
