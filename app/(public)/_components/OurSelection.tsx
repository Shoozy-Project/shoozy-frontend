import Image from 'next/image';
import Link from 'next/link';

export default function OurSelection() {
  const products = [
    {
      id: 1,
      name: 'Moccasin 180',
      category: 'The Emblematic Women',
      description: 'Initial blue calfskin box & coconut calfskin box',
      price: 780.000,
      colors: '30 colors',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIbVgJfJXIdygEb6zPKaiwlqffbPhR7dMomJdteQWZQn-WrtPopJsSZOckU2bIIxY3T4l5gljym6ZPNjMBwmGQitXeaxd3XoKKo_v9iRLRklFmorgFSQG1_EdT8_XQvcQkjA3OVOa27RGA_CCbwYJNfxTItcAVFXZ2FC2yKW9Be2g2YmxsfWV2iiHCy6h1FVhyo4rg3Jw0_SDExRg10ZWeLakhBGoyyI2lZcyq8XHx_ibHFUCu1akT6Q',
    },
    {
      id: 2,
      name: 'Moccasin 180',
      category: 'The Emblematic Women',
      description: 'Initial blue calfskin box & coconut calfskin box',
      price: 780.000,
      colors: '30 colors',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB16hB2wvi0HNGBaouRIY2sB6zwwrPPxYS5uvQjcQXB2EyRg6LrtfCbeaZjVQoI6MxizMlyCpQwjUaEXdfyMU-f4FJLqwSZO4xpFNtiMKftEgtt_1Vm9MJR49dBPjcRWfaxccg8qhbF02LluqmGn0FVIO5eNt6QU9Y-WdchNoPcWfDyWcR_b1TbM8Pm1u8lVhjGVTikyqGo9PMSVuteMfjgZ-OZWhe-KeWZKqmTg1hWveY9j3aYs0dvQQ',
    },
    {
      id: 3,
      name: 'Moccasin 180',
      category: 'The Emblematic Women',
      description: 'Initial blue calfskin box & coconut calfskin box',
      price: 780.000,
      colors: '30 colors',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCC3ANouBXgXSkE69fNOUm2_KDza_IgIEipC_DnxSWCjlhkcsobuH9nnteixazsN0WJeHCux3uCz39ADj70EBbH4YHPXaAI3A6tYqssjNJNdXAIF1Y2xng4o0bah9QYej88GY4OhJF2VXxJcx3XDOruLuVUgfkxPazNpcG630iVBer2gQ3324bNw0lfPHAw55lTU2QMiqmnAAzKFY2wIVfMkylbBsxz6L1yd236pOL9-9a0gsRkpjGN1w',
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl mb-8 text-foreground">Our selection</h2>
          <div className="flex justify-center space-x-8 border-b border-border/50 pb-4">
            <button className="text-sm tracking-widest text-foreground/50 hover:text-foreground transition-colors uppercase">
              Men
            </button>
            <button className="text-sm tracking-widest text-foreground border-b-2 border-foreground pb-1 uppercase">
              Women
            </button>
            <button className="text-sm tracking-widest text-foreground/50 hover:text-foreground transition-colors uppercase">
              Accessories
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <Link href={`/product/${product.id}`} key={product.id} className="group cursor-pointer">
              {/* Image Container */}
              <div className="relative w-full aspect-[4/3] bg-[#f7f7f7] mb-6 overflow-hidden flex items-center justify-center p-8">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={400}
                  height={300}
                  className="object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Product Info */}
              <div className="space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-blue-400/80 mb-1">{product.category}</p>
                    <h3 className="font-serif text-lg text-foreground font-bold">{product.name}</h3>
                  </div>
                  <span className="text-[10px] text-foreground/50">{product.colors}</span>
                </div>
                <p className="text-sm text-foreground/70 leading-relaxed pr-8">
                  {product.description}
                </p>
                <p className="font-sans text-sm font-medium pt-2 text-foreground">
                  {product.price.toFixed(3)} TND
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
