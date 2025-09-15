import Image from "next/image";
import { Card } from "@/components/ui/card";

interface ImageCardProps {
  title: string;
  imageSrc: string;
}

export default function ImageCard({ title = "Verduras", imageSrc = "/vegetales.webp" }: ImageCardProps) {
  return (
    <Card className="w-32 h-32 p-0 rounded-lg overflow-hidden shadow-md relative cursor-pointer">
      {/* Imagen ocupa TODO el contenedor */}
      <div className="relative w-full h-full">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Texto centrado */}
      <h3 className="absolute inset-0 flex items-center justify-center text-black text-lg font-bold pointer-events-none">
        {title}
      </h3>
    </Card>
  );
}
