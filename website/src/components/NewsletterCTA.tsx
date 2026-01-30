'use client'

import { SubscribeButton } from './SubscribeButton'

interface NewsletterCTAProps {
  title?: string
  description?: string
  source?: string
}

export function NewsletterCTA({ 
  title = "Get the Technical Dispatch",
  description = "New articles, tutorials, and mechanical wisdom delivered straight to your inbox. No spam, just pure technical content.",
  source = "cta"
}: NewsletterCTAProps) {
  return (
    <section className="border-4 border-[#CCAA4C] bg-[#252219] p-8 md:p-12">
      <div className="max-w-2xl mx-auto text-center">
        <h2 
          className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[#CCAA4C] mb-4"
          style={{ fontFamily: "var(--font-oswald), sans-serif" }}
        >
          {title}
        </h2>
        <p className="text-[#E3E2D5]/80 text-lg mb-8">
          {description}
        </p>
        <div className="max-w-xs mx-auto">
          <SubscribeButton 
            source={source} 
            fullWidth 
            size="lg"
            variant="primary"
          >
            Subscribe Now
          </SubscribeButton>
        </div>
      </div>
    </section>
  )
}
