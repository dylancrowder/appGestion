
import ImageCard from "@/components/customUI/CategoriCart";
import { DrawerCart } from "@/components/customUI/DrawerCart";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";



export default function DashboardPage() {
  return (
    // Este div ocupa todo el ancho de la pantalla
    <div className="flex justify-center items-center w-full">
      {/* Contenedor centrado para las cartas */}
      <div className="flex w-full">



       
        <div className="w-full mr-4">
           <DrawerCart className="w-full">
          <Input type="email" placeholder="Email" className="w-full" />
          
          <div className="flex w-full">

 <ImageCard/>

  <ImageCard/>
   <ImageCard/>

          </div>
        </DrawerCart>




        <DrawerCart className="w-full">
          Productos destacados
          
        </DrawerCart>
        </div>
      
        <DrawerCart className="w-1/2">
          VENTAS
        </DrawerCart>
      </div>
    </div>
  );
}
