import { Package } from "lucide-react";
import Image from "next/image";
import { mediaSrc } from "@/lib/utils/media";
import { cn } from "@/lib/utils/cn";

interface ProductImageProps {
  foto: string | null;
  nome: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Foto do produto servida pela rota /api/media (mesma origem).
 * `unoptimized`: a API já grava as fotos em WebP com no máximo 1200px, e o otimizador
 * do Next buscaria a imagem sem os cookies de sessão exigidos pela rota.
 */
export function ProductImage({
  foto,
  nome,
  className,
  sizes,
  priority,
}: Readonly<ProductImageProps>) {
  const src = mediaSrc(foto);
  return (
    <div className={cn("relative aspect-square overflow-hidden bg-muted", className)}>
      {src ? (
        <Image
          src={src}
          alt={nome}
          fill
          unoptimized
          priority={priority}
          sizes={sizes ?? "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <Package className="size-12" aria-hidden="true" />
          <span className="sr-only">Produto sem foto</span>
        </div>
      )}
    </div>
  );
}
