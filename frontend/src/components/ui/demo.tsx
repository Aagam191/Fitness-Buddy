"use client"

import MorphGallery from "@/components/ui/morph-gallery"

const ITEMS = [
  {
    src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop",
    thumb: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=200&auto=format&fit=crop",
    alt: "Gym athlete training barbell deadlift",
  },
  {
    src: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop",
    thumb: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=200&auto=format&fit=crop",
    alt: "Athlete lifting dumbbells in bodybuilding session",
  },
  {
    src: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1470&auto=format&fit=crop",
    thumb: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=200&auto=format&fit=crop",
    alt: "Crossfit athlete intense conditioning workout",
  },
  {
    src: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1470&auto=format&fit=crop",
    thumb: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=200&auto=format&fit=crop",
    alt: "Powerlifting rack setup in dark gym",
  },
  {
    src: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1470&auto=format&fit=crop",
    thumb: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=200&auto=format&fit=crop",
    alt: "Athlete doing battle ropes explosive training",
  },
]

export default function Demo() {
  return (
    <div className="relative w-full">
      <MorphGallery items={ITEMS} autoplay={4500} />
    </div>
  )
}
