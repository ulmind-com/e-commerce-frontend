'use client'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { HeartIcon, ShoppingCartIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardDescription, CardTitle, CardFooter, CardContent } from '@/components/ui/card'

import { cn } from '@/lib/utils'

// Gradient presets for products without images
const gradients = [
  'from-violet-600 to-indigo-300',
  'from-rose-600 to-amber-300',
  'from-emerald-600 to-teal-300',
  'from-blue-600 to-cyan-300',
  'from-fuchsia-600 to-pink-300',
  'from-amber-600 to-yellow-300',
  'from-neutral-600 to-violet-300',
  'from-sky-600 to-indigo-300',
]

// Stock product images from Unsplash for products without images
const fallbackImages = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=300&h=300&fit=crop',
]

interface ProductCardProps {
  product: {
    _id: string
    title: string
    description: string
    price: number
    stock_quantity: number
    category_id: string
    image_urls: string[]
    is_published: boolean
  }
  onAddToCart?: (product: any) => void
  index?: number
}

const ProductCard = ({ product, onAddToCart, index = 0 }: ProductCardProps) => {
  const [liked, setLiked] = useState<boolean>(false)
  const [added, setAdded] = useState<boolean>(false)
  const navigate = useNavigate()

  const gradient = gradients[index % gradients.length]
  const hasImage = product.image_urls && product.image_urls.length > 0
  const displayImage = hasImage
    ? product.image_urls[0]
    : fallbackImages[index % fallbackImages.length]

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onAddToCart && product.stock_quantity > 0) {
      onAddToCart(product)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }
  }

  const handleCardClick = () => {
    navigate(`/products/${product._id}`)
  }

  // Truncate description to ~80 chars
  const desc = product.description || '';
  const shortDesc = desc.length > 80
    ? desc.substring(0, 80) + '...'
    : desc;

  return (
    <div
      className={cn(
        'group relative rounded-xl bg-gradient-to-r pt-0 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer',
        gradient
      )}
      onClick={handleCardClick}
    >
      <div className='flex h-52 items-center justify-center overflow-hidden rounded-t-xl'>
        <img
          src={displayImage}
          alt={product.title}
          className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
        />
      </div>
      <Button
        size='icon'
        onClick={(e) => {
          e.stopPropagation()
          setLiked(!liked)
        }}
        className='bg-primary/10 hover:bg-primary/20 absolute top-4 right-4 rounded-full backdrop-blur-sm'
      >
        <HeartIcon className={cn('size-4', liked ? 'fill-destructive stroke-destructive' : 'stroke-white')} />
        <span className='sr-only'>Like</span>
      </Button>
      <Card className='border-none rounded-t-none'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-lg line-clamp-1'>{product.title}</CardTitle>
          <CardDescription className='flex items-center gap-2 flex-wrap'>
            {product.stock_quantity > 0 ? (
              <Badge variant='outline' className='text-emerald-600 border-emerald-200 bg-emerald-50'>
                In Stock
              </Badge>
            ) : (
              <Badge variant='destructive'>
                Out of Stock
              </Badge>
            )}
            {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
              <Badge variant='outline' className='text-amber-600 border-amber-200 bg-amber-50'>
                Only {product.stock_quantity} left
              </Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className='pb-2'>
          <p className='text-sm text-muted-foreground line-clamp-2'>{shortDesc}</p>
        </CardContent>
        <CardFooter className='justify-between gap-3 max-sm:flex-col max-sm:items-stretch'>
          <div className='flex flex-col'>
            <span className='text-xs font-medium uppercase text-muted-foreground'>Price</span>
            <span className='text-xl font-bold'>₹{(product.price || 0).toFixed(2)}</span>
          </div>
          <Button
            size='lg'
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            className={cn(
              'gap-2 transition-all',
              added && 'bg-emerald-600 hover:bg-emerald-700'
            )}
          >
            <ShoppingCartIcon className='size-4' />
            {added ? 'Added!' : 'Add to Cart'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ProductCard
